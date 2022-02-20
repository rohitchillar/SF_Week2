const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getReturnAmount = (investment, stakeFactor) => {
    return investment*stakeFactor;
}

module.exports = {randomNumber, getReturnAmount};