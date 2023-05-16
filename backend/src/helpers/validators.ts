
/**
 * Checks if string is a valid image url 
 * @param url string url to validate
 * @returns boolean
 */
export const validateUrl = (url: string): boolean => {
    const regex = /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/;
    return regex.test(url);
};
