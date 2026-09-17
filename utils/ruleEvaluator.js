function evaluateRule(value, operator, threshold) {

  switch (operator) {

    case ">":
      return value > threshold;

    case "<":
      return value < threshold;

    case ">=":
      return value >= threshold;

    case "<=":
      return value <= threshold;

    case "==":
      return value == threshold;

    case "!=":
      return value != threshold;

    default:
      return false;
  }
}

module.exports = evaluateRule;