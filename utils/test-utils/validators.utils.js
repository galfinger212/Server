exports.validateNotEmpty = (received) => {
    expect(received).not.toBeNull();
    expect(received).not.toBeUndefined();
    expect(received).toBeTruthy();
};


exports.validateStringEquality = (received, expected) => {
    expect(received).toEqual(expected);
};