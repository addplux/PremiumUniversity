let tf;
try {
    tf = require('@tensorflow/tfjs');
} catch (e) {
    console.warn('⚠️ @tensorflow/tfjs not found. Retention Predictor will use baseline heuristics.');
}

const RetentionData = require('../models/RetentionData');

class RetentionPredictorService {
    constructor() {
        this.model = null;
        this.isTrained = false;
    }

    /**
     * Extract features from retention data record
     * Normalizes values 0-1 where appropriate
     */
    extractFeatures(data) {
        return [
            data.academic.gpa / 4.0,                                    // Normalized GPA
            data.academic.attendanceRate / 100,                         // Attendance
            data.academic.assignmentCompletionRate / 100,               // Assignments
            Math.min(data.academic.failedCoursesCount / 5, 1),          // Failures (capped)
            Math.min(data.engagement.loginFrequency / 10, 1),           // Logins (capped)
            Math.min(data.engagement.daysSinceLastActivity / 30, 1),    // Inactivity (capped 30 days)
            data.financial.tuitionPaidPercent / 100,                    // Tuition Paid
            data.financial.hasOutstandingBalance ? 1 : 0,               // Has Debt
        ];
    }

    /**
     * Build and compile the ML model
     */
    buildModel() {
        const model = tf.sequential();

        // Input layer (8 features) -> Hidden Layer 1
        model.add(tf.layers.dense({
            inputShape: [8],
            units: 16,
            activation: 'relu'
        }));

        // Dropout for regularization
        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Hidden Layer 2
        model.add(tf.layers.dense({
            units: 8,
            activation: 'relu'
        }));

        // Output Layer (Sigmoid for probability 0-1)
        model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }));

        model.compile({
            optimizer: tf.train.adam(0.01),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        this.model = model;
        return model;
    }

    /**
     * Train model on historical data
     * In a real system, this would fetch labeled data (dropped out vs retained)
     */
    async trainModel(historicalData) {
        if (!historicalData || historicalData.length === 0) {
            console.warn('No training data available. Using baseline heuristic model.');
            return;
        }

        const inputs = historicalData.map(d => this.extractFeatures(d));
        const labels = historicalData.map(d => d.retained ? 1 : 0);

        const inputTensor = tf.tensor2d(inputs);
        const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

        if (!this.model) this.buildModel();

        console.log('🧠 Training Retention Model...');
        await this.model.fit(inputTensor, labelTensor, {
            epochs: 50,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });

        this.isTrained = true;
        console.log('✅ Model Trained Successfully');

        // Clean up tensors
        inputTensor.dispose();
        labelTensor.dispose();
    }

    /**
     * Predict retention risk for a single student record
     */
    async predictRisk(retentionDataRecord) {
        // If no ML model trained yet or TF is missing, fall back to heuristic score
        if (!this.isTrained || !this.model || !tf) {
            retentionDataRecord.calculateBaselineRisk();
            return {
                score: retentionDataRecord.riskPrediction.score,
                level: retentionDataRecord.riskPrediction.riskLevel,
                factors: retentionDataRecord.riskPrediction.riskFactors
            };
        }

        // Use ML Model
        const features = this.extractFeatures(retentionDataRecord);
        const inputTensor = tf.tensor2d([features]);

        const prediction = this.model.predict(inputTensor);
        const score = (await prediction.data())[0] * 100; // 0-100 score

        inputTensor.dispose();
        prediction.dispose();

        // Map score to risk level
        let level = 'low';
        const factors = [];

        if (score < 40) level = 'critical';
        else if (score < 60) level = 'high';
        else if (score < 80) level = 'medium';

        // Heuristic factor identification (Model explanation)
        if (features[1] < 0.7) factors.push('Low Attendance'); // attendance
        if (features[5] > 0.5) factors.push('Recent Inactivity'); // inactivity
        if (features[0] < 0.5) factors.push('Academic Struggles'); // gpa
        if (features[7] === 1) factors.push('Financial Holds'); // debt

        return {
            score: Math.round(score),
            level,
            factors
        };
    }
}

module.exports = new RetentionPredictorService();
