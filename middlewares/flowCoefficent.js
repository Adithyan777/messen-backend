
const convert = require('convert-units');

function convertToPsia(value, unit) {
  const psiValue = convert(value).from(unit).to('psi');
  const psiaValue = psiValue + 14.7;
  return psiaValue;
}

function convertFromPsia(value, unit) {
  const psiValue = value - 14.7; 
  const result = convert(psiValue).from('psi').to(unit);
  return result;
}

function roundToSignificantFigures(value, n) {
  if (value === 0) return 0;
  return Number(value.toFixed(n))
}


function convertToSelectedUnits(resultInBaseUnit, selectedUnitsResult) {
    const baseUnitsResult = {
      pressureDropAcrossInletReducers: 'psi',
      pressureAtTheValveInlet: 'psia',
      pressureDropAcrossReducers: 'psi',
      pressureDropAcrossTheValveConsideringThePressureDropAcrossReducers: 'psi',
      chokedPressureDropAcrossTheValve: 'psi',
      actualPressureDropUsedForValveSizing: 'psi',
    };

    const resultInSelectedUnit = {};

    // Iterate over each property in baseUnitsResult
    for (const key in baseUnitsResult) {
      if (baseUnitsResult.hasOwnProperty(key)) {
        const baseUnit = baseUnitsResult[key];
        const selectedUnit = selectedUnitsResult[key];

        if (selectedUnit === baseUnit) {
          resultInSelectedUnit[key] = resultInBaseUnit[key];
        } else {
          if (selectedUnit === 'psia' || baseUnit === 'psia') {
            if (selectedUnit === 'psia') {
              resultInSelectedUnit[key] = roundToSignificantFigures(convertToPsia(resultInBaseUnit[key], baseUnit),4);
            } else {
              resultInSelectedUnit[key] = roundToSignificantFigures(convertFromPsia(resultInBaseUnit[key], selectedUnit),4);
            }
          } else {
            // Convert value to selected unit
            resultInSelectedUnit[key] = roundToSignificantFigures(convert(resultInBaseUnit[key]).from(baseUnit).to(selectedUnit),4);
          }
        }
      }
    }
    resultInSelectedUnit['requiredFlowCoefficient'] = resultInBaseUnit['requiredFlowCoefficient'];
    return resultInSelectedUnit;
}

function convertToBaseUnits(req, res, next) {

  const formData = req.body.formData;
  const selectedUnit = req.body.selectedUnit;
  console.log(formData);
  console.log(selectedUnit);
  
  req.data = {
    flowRate: convert(parseFloat(formData.flowRate)).from(selectedUnit.flowRate).to('gal/min'),
    pressureDrop: convert(parseFloat(formData.pressureDrop)).from(selectedUnit.pressureDrop).to('psi'),
    specificGravity: parseFloat(formData.specificGravity), // specific gravity is unitless
    recoveryFactor: (selectedUnit.recoveryFactor === '%' ? parseFloat(formData.recoveryFactor / 100) : parseFloat(formData.recoveryFactor)),
    lineDiameter: convert(parseFloat(formData.lineDiameter)).from(selectedUnit.lineDiameter).to('in'),
    valveDiameter: convert(parseFloat(formData.valveDiameter)).from(selectedUnit.valveDiameter).to('in'),
    inletPressure: (selectedUnit.inletPressure === 'psia' ? parseFloat(formData.inletPressure) : convertToPsia(parseFloat(formData.inletPressure),selectedUnit.inletPressure)),
    vapourPressure: (selectedUnit.vapourPressure === 'psia' ? parseFloat(formData.vapourPressure) : convertToPsia(parseFloat(formData.vapourPressure),selectedUnit.vapourPressure)),
    criticalPressure: (selectedUnit.criticalPressure === 'psia' ? parseFloat(formData.criticalPressure) : convertToPsia(parseFloat(formData.criticalPressure),selectedUnit.criticalPressure))
  };
  next();
}

module.exports = {convertToBaseUnits,convertToSelectedUnits};
