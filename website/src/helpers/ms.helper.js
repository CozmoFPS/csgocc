const units = {
    "seconds": 1000,
    "minutes": 1000 * 60,
    "hours": 1000 * 60 * 60,
    "days": 1000 * 60 * 60 * 24,
    "weeks": 1000 * 60 * 60 * 24 * 7,
    "months": 1000 * 60 * 60 * 24 * 30,
    "years": 1000 * 60 * 60 * 24 * 365,
}

/**
 * Converts a given value to milliseconds based on the specified unit.
 *
 * @param {number} value The numerical value to be converted.
 * @param {"seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"} unit The unit of the value.
 * @returns {number} The value converted to milliseconds.
 * @throws {Error} Throws an error if the arguments are invalid or if the unit is not recognized.
 */
function ms(value, unit){
    if(typeof value == 'string'){
        value = parseFloat(value)
        if(isNaN(value)){
            throw error("msStringConvert", "Failed string to number conversion", `Failed to convert the given string to a number: ${value}`)
        }
    }

    if (typeof value !== 'number' || typeof unit !== 'string') {
        throw error("msTypeInvalid", "Invalid Types", `Expected a number and a string, but got ${value} and ${unit}`);
    }

    const unitValue = units[unit.toLowerCase()];
    if (!unitValue) {
        throw error("msUnitInvalid", "Invalid Unit", `Expected a valid unit, but got ${unit}`)
    }

    return value * unitValue;
}

module.exports = ms