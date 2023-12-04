export default {
    methods: {
        validateRule(condition, message) {
            return condition ? true : message;
        },
        // validateEmail(email) {
        //     return /(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
        // },
        validateNumber(input, message = 'Only numbers are allowed') {
            return this.validateRule(isFinite(parseFloat(input)), message);
        },
        validateMatch(value, match) {
            if (!value) {
                return false;
            }
            return value.toString() === match.toString();
        },
        validateStrongPassword(password, message = 'Your password must be at least 8 characters and should contain uppercase, lowercase and numbers.') {
            return this.validateRule((password && password.length > 7 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)), message);
        },
        validateUrl(url) {
            if (!url || url.length == 0) {
                return true;
            }
            //TODO: Get better regex
            return this.validateRule(/(ftp|http|https):\/\/(\w+:{0,1}\w*@composer in)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url), 'Please enter a valid URL')
        },
        validateAlphaNumUnderscore(value, message = 'Only characters, numbers and underscores are allowed') {
            return this.validateRule(/^[a-zA-Z0-9_]+$/.test(value), message);
        },
        validateUnique(value, valuesArray, message = 'The value must be unique') {
            return this.validateRule(valuesArray.indexOf(value) == -1, message);
        },
        validateUniqueIncluding(value, valuesArray, message = 'The value must be unique') {
            return this.validateRule(valuesArray.filter(v => v == value).length == 1, message);
        },


        //Rocket form
        validateRequired(value, name) {
            return this.validateRule(!!value && (!Array.isArray(value) || value.length > 0) && (typeof value != 'object' || Object.values(value).length > 0), 'The ' + name.toTitleCase() + ' field is required');
        },
        validateNumeric(value, name) {
            return this.validateRule(/^[0-9]*$/gm.test(value), 'The ' + name.toTitleCase() + ' field only allows numeric characters');
        },
        validateEmail(value, name = 'Email') {
            return this.validateRule(/(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value), 'The ' + name.toTitleCase() + ' field requires a valid email address');
        }
    }
}
