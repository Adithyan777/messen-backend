const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');
const {convertToBaseUnits,convertToSelectedUnits} = require('./middlewares/flowCoefficent');
const {
    calculateDP_IR,
    calculateP1_VLV,
    calculateDP_REDUCERS,
    calculateDP_VLV,
    calculateDP_CHOKED_VLV,
    calculateDP_SIZING,
    calculateRequiredCv
} = require('./calculations/flowCoefficent');

function roundToSignificantFigures(value, n) {
        if (value === 0) return 0;
        return Number(value.toFixed(n))
}

app.use(cors());
app.use(express.json());

  
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/flowRate', convertToBaseUnits,(req, res) => {
    const { flowRate, specificGravity, valveDiameter, lineDiameter, inletPressure, pressureDrop, recoveryFactor, vapourPressure, criticalPressure } = req.data;
    const inletPressureSelectedUnit = req.body.selectedUnit.inletPressure;
    console.log({ flowRate, specificGravity, valveDiameter, lineDiameter, inletPressure, pressureDrop, recoveryFactor, vapourPressure, criticalPressure })

    const DP_IR = roundToSignificantFigures(calculateDP_IR(flowRate, specificGravity, valveDiameter, lineDiameter), 4);
    const P1_VLV = roundToSignificantFigures(calculateP1_VLV(inletPressure, DP_IR), 4);
    const DP_REDUCERS = roundToSignificantFigures(calculateDP_REDUCERS(flowRate, specificGravity, valveDiameter, lineDiameter), 4);
    const DP_VLV = roundToSignificantFigures(calculateDP_VLV(pressureDrop, DP_REDUCERS), 4);
    const DP_CHOKED_VLV = roundToSignificantFigures(calculateDP_CHOKED_VLV(recoveryFactor, P1_VLV, vapourPressure, criticalPressure), 4);
    const DP_SIZING = roundToSignificantFigures(calculateDP_SIZING(DP_VLV, DP_CHOKED_VLV), 4);
    const requiredCv = roundToSignificantFigures(calculateRequiredCv(flowRate, specificGravity, DP_SIZING), 4);
    
    const resultInBaseUnit = {
        "pressureDropAcrossInletReducers" : DP_IR,
        "pressureAtTheValveInlet": P1_VLV,
        "pressureDropAcrossReducers": DP_REDUCERS,
        "pressureDropAcrossTheValveConsideringThePressureDropAcrossReducers": DP_VLV,
        "chokedPressureDropAcrossTheValve" : DP_CHOKED_VLV,
        "actualPressureDropUsedForValveSizing" : DP_SIZING,
        "requiredFlowCoefficient" : requiredCv
    }
    const selectedUnitsResult = {
        "pressureDropAcrossInletReducers" : inletPressureSelectedUnit,
        "pressureAtTheValveInlet": inletPressureSelectedUnit,
        "pressureDropAcrossReducers": inletPressureSelectedUnit,
        "pressureDropAcrossTheValveConsideringThePressureDropAcrossReducers": inletPressureSelectedUnit,
        "chokedPressureDropAcrossTheValve" : inletPressureSelectedUnit,
        "actualPressureDropUsedForValveSizing" : inletPressureSelectedUnit,
    }

    const resultInSelectedUnit = convertToSelectedUnits(resultInBaseUnit,selectedUnitsResult);
    res.json(resultInSelectedUnit);
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
});

