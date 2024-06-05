// flow rate calcualtions
/* 
    baseUnits for calculations =
    {
        "Flow" : "gpm",
        "Inlet Pressure": "psia",
        "Pressure Drop": "psi",
        "Specific Gravity": "unitless",
        "Vapour Pressure": "psia",
        "Critical Pressure": "psia"
        "Recovery Factor": "%",
        "Line Diameter": "inch",
        "Valve Diameter": "inch"
    } 
*/ 

function calculateDP_IR(flowRate, specificGravity, valveDiameter, lineDiameter) {
  return (
      (0.5 * (1 - Math.pow(valveDiameter / lineDiameter, 2)) ** 2 + 1 - Math.pow(valveDiameter / lineDiameter, 4)) * 
      (flowRate ** 2 * specificGravity / (890 * Math.pow(valveDiameter, 4)))
  );
}

function calculateP1_VLV(inletPressure, dpIr) {
  return inletPressure - dpIr;
}

function calculateDP_REDUCERS(flowRate, specificGravity, valveDiameter, lineDiameter) {
  return (
      1.5 * (1 - Math.pow(valveDiameter / lineDiameter, 2)) ** 2 * 
      (flowRate ** 2 * specificGravity / (890 * Math.pow(valveDiameter, 4)))
  );
}

function calculateDP_VLV(pressureDrop, dpReducers) {
  return pressureDrop - dpReducers;
}

function calculateDP_CHOKED_VLV(recoveryFactor, p1Vlv, vaporPressure, criticalPressure) {
  return (
      Math.pow(recoveryFactor, 2) * 
      (p1Vlv - vaporPressure * (0.96 - 0.28 * Math.sqrt(vaporPressure / criticalPressure)))
  );
}

function calculateDP_SIZING(dpVlv, dpChokedVlv) {
  return dpVlv < dpChokedVlv ? dpVlv : dpChokedVlv;
}

function calculateRequiredCv(flowRate, specificGravity, dpSizing) {
  return flowRate * Math.sqrt(specificGravity / dpSizing);
}

  
  module.exports = {
    calculateDP_IR,
    calculateP1_VLV,
    calculateDP_REDUCERS,
    calculateDP_VLV,
    calculateDP_CHOKED_VLV,
    calculateDP_SIZING,
    calculateRequiredCv
  };
  