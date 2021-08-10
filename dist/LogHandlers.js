"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInfo = exports.handleObject = exports.handleLogform = exports.handlePrimitive = exports.isTransformableInfo = void 0;
const utility_types_1 = require("utility-types");
const discord_js_1 = require("discord.js");
const LogLevels_1 = require("./LogLevels");
const isTransformableInfo = (info) => {
    return Boolean(info && "level" in info && "message" in info);
};
exports.isTransformableInfo = isTransformableInfo;
const sortFields = (fields) => {
    const sortedFields = [];
    const timestampIndex = fields.findIndex((value) => value === "timestamp");
    const levelIndex = fields.findIndex((value) => value === "level");
    const messageIndex = fields.findIndex((value) => value === "message");
    if (timestampIndex !== -1) {
        sortedFields.push(fields[timestampIndex]);
    }
    if (levelIndex !== -1) {
        sortedFields.push(fields[levelIndex]);
    }
    if (messageIndex !== -1) {
        sortedFields.push(fields[messageIndex]);
    }
    for (const field of fields) {
        if (field !== "level" && field !== "message" && field !== "timestamp") {
            sortedFields.push(field);
        }
    }
    return sortedFields;
};
const handlePrimitive = (info) => {
    switch (typeof info) {
        case "string": {
            return info;
        }
        default: {
            return String(info);
        }
    }
};
exports.handlePrimitive = handlePrimitive;
const handleLogform = (info, level) => {
    var _a;
    if ((level && level === info.level) || !level) {
        const messageEmbed = new discord_js_1.MessageEmbed();
        let logMessageString = "";
        const color = level
            ? (_a = LogLevels_1.LogLevelToColor[level]) !== null && _a !== void 0 ? _a : "DEFAULT"
            : "DEFAULT";
        messageEmbed.setColor(color);
        const fields = sortFields(Object.keys(info));
        for (const field of fields) {
            const capitalize = (str) => str.charAt(0).toLocaleUpperCase() + str.slice(1);
            if (info[field]) {
                const fieldsIndex = fields.indexOf(field);
                if (fieldsIndex !== 0) {
                    logMessageString += ", ";
                }
                const capitalizedField = capitalize(field);
                const value = info[field];
                logMessageString += `${capitalizedField}: ${value}`;
                messageEmbed.addField(capitalizedField, value.toString(), true);
            }
        }
        return [logMessageString, messageEmbed];
    }
    return undefined;
};
exports.handleLogform = handleLogform;
const handleObject = (info, format, level) => {
    if (exports.isTransformableInfo(info)) {
        if (format) {
            const formattedInfo = format.transform(info);
            if (exports.isTransformableInfo(formattedInfo)) {
                return exports.handleLogform(formattedInfo, level);
            }
            else {
                return exports.handlePrimitive(formattedInfo);
            }
        }
        else {
            return exports.handleLogform(info, level);
        }
    }
    else if (info instanceof Error && info.stack) {
        return info.stack;
    }
    else if (typeof (info === null || info === void 0 ? void 0 : info.toString) === "function" &&
        info.toString !== Object.toString) {
        return info.toString();
    }
    else {
        // this will call toJSON on the object, if it exists
        return JSON.stringify(info);
    }
};
exports.handleObject = handleObject;
const handleInfo = (info, format, level) => {
    if (utility_types_1.isPrimitive(info)) {
        return exports.handlePrimitive(info);
    }
    else if (typeof info === "function") {
        return exports.handleInfo(info(), format, level);
    }
    else {
        return exports.handleObject(info, format, level);
    }
};
exports.handleInfo = handleInfo;
