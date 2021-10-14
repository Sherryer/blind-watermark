module.exports = (data = [], num) => {
    let baseData = [...data];
    let result = [];

    for (let i = 0, len = baseData.length; i < len; i += num) {
        let partData = data.slice(i, i + num);
        if (partData.length) {
            result.push(partData)
        }
    }
    return result
};
