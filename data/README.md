# Open Data — SupplierHub Research Dataset

This folder contains the raw evaluation data used in the research paper:

> **"SupplierHub: Hybrid Haversine-SAW and Generative AI for B2B MSME Partner Discovery"**
> Submitted to ICCSCI 2026 (Procedia Computer Science, Elsevier)

## Files

| File | Description | Format |
|------|-------------|--------|
| `sus_survey_results.csv` | System Usability Scale (SUS) questionnaire results (N=24 respondents) | CSV |
| `saw_computation_sample.csv` | Sample output of the SAW (Simple Additive Weighting) multi-criteria computation | CSV |
| `blackbox_testing_results.csv` | Complete Black-Box functional testing results (15 test scenarios) | CSV |

## SUS Methodology

The SUS evaluation was conducted with **N=24** respondents consisting of MSME owners and business professionals. The standard 10-item SUS questionnaire (Brooke, 1996) was administered. Scoring follows the standard protocol:
- **Odd items (positive):** score = response − 1
- **Even items (negative):** score = 5 − response
- **Final SUS Score** = Σ(converted scores) × 2.5

**Result:** SUS Score = **84.40** → Grade **B** (Excellent / Acceptable)

## SAW Algorithm Parameters

The SAW (Simple Additive Weighting) computation uses two criteria:
- **C1 — Distance (Haversine):** Weight = 0.6, Type = Cost (lower is better)
- **C2 — Rating (Google Places):** Weight = 0.4, Type = Benefit (higher is better)

Normalization formulas:
- Cost: `r_ij = min(C_j) / x_ij`
- Benefit: `r_ij = x_ij / max(C_j)`

Final score: `V_i = Σ(W_j × r_ij) × 100`

## License

This dataset is provided under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.
If you use this data, please cite the associated research paper.
