const EquityAudit = require('../models/EquityAudit');
const Grade = require('../models/Grade'); // Assuming Grade model exists or will exist
const User = require('../models/User');

class EquityAuditService {

    /**
     * Run a Chi-Square Test for Independence
     * @param {Object} observed - Observed frequencies map (e.g., { male: { pass: 50, fail: 10 }, female: { pass: 40, fail: 20 } })
     */
    calculateChiSquare(observed) {
        // 1. Calculate Row and Column Totals
        const rowTotals = {};
        const colTotals = {};
        let grandTotal = 0;

        const rows = Object.keys(observed); // e.g., ['male', 'female']
        if (rows.length === 0) return { pValue: 1, chiSquare: 0, isSignificant: false };

        const cols = Object.keys(observed[rows[0]]); // e.g., ['pass', 'fail']

        rows.forEach(row => {
            rowTotals[row] = 0;
            cols.forEach(col => {
                const val = observed[row][col] || 0;
                rowTotals[row] += val;
                colTotals[col] = (colTotals[col] || 0) + val;
                grandTotal += val;
            });
        });

        if (grandTotal === 0) return { pValue: 1, chiSquare: 0, isSignificant: false };

        // 2. Calculate Chi-Square Statistic
        let chiSquare = 0;

        rows.forEach(row => {
            cols.forEach(col => {
                const observedVal = observed[row][col] || 0;
                const expectedVal = (rowTotals[row] * colTotals[col]) / grandTotal;

                if (expectedVal > 0) {
                    chiSquare += Math.pow(observedVal - expectedVal, 2) / expectedVal;
                }
            });
        });

        // 3. Approximate P-Value (Simplified for 1 Degree of Freedom - 2x2 table)
        // For df=1 (Gender x Pass/Fail), critical value at p=0.05 is 3.841
        const df = (rows.length - 1) * (cols.length - 1);
        let pValue = 1.0;

        // Approximation for P-Value from Chi-Sq
        if (df === 1) {
            // Simple lookup for df=1
            if (chiSquare > 10.83) pValue = 0.001;
            else if (chiSquare > 6.63) pValue = 0.01;
            else if (chiSquare > 3.84) pValue = 0.05;
            else if (chiSquare > 2.71) pValue = 0.10;
            else pValue = 0.5; // > 0.1
        } else {
            // Generic fallback for now
            pValue = Math.exp(-0.5 * chiSquare); // Very rough approx for higher df
        }

        return {
            chiSquare,
            pValue,
            isSignificant: pValue <= 0.05
        };
    }

    /**
     * Run Grading Equity Audit
     * Analyzes grade distribution by gender
     */
    async runGradingAudit(organizationId, period) {
        // 1. Fetch Data (Mocking aggregation for now, assuming Grade model structure)
        // In real implementation: Aggregate Grade joins User on studentId
        /*
          const grades = await Grade.aggregate([
            { $match: { organizationId, date: { $gte: period.startDate, $lte: period.endDate } } },
            { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
            { $unwind: '$student' },
            { $project: { grade: 1, gender: '$student.gender' } }
          ]);
        */

        // Simulate Observed Data for logic demonstration
        // High Pass Rate vs Low Pass Rate
        const observed = {
            male: { pass: 120, fail: 15 },
            female: { pass: 95, fail: 25 }
        };

        const stats = this.calculateChiSquare(observed);

        const auditRecord = new EquityAudit({
            organizationId,
            auditType: 'grading',
            period,
            metrics: {
                totalAnalyzed: 255,
                byGender: {
                    male: { pass: 120, fail: 15 },
                    female: { pass: 95, fail: 25 }
                },
                outcomeRates: {
                    male: (120 / 135) * 100,
                    female: (95 / 120) * 100,
                    overall: (215 / 255) * 100
                }
            },
            findings: []
        });

        if (stats.isSignificant) {
            auditRecord.findings.push({
                category: 'Gender Disparity in Passing Rates',
                severity: stats.chiSquare > 10 ? 'high' : 'medium',
                description: `Statistically significant difference (p < ${stats.pValue}) found between male and female passing rates.`,
                statisticalSignificance: stats,
                recommendation: 'Review grading rubrics and conduct blind grading experiments.'
            });
        } else {
            auditRecord.findings.push({
                category: 'Gender Parity',
                severity: 'low',
                description: 'No significant disparity found in grading outcomes.',
                statisticalSignificance: stats,
                recommendation: 'Continue monitoring.'
            });
        }

        await auditRecord.save();
        return auditRecord;
    }
}

module.exports = new EquityAuditService();
