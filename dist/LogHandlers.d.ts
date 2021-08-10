import { TransformableInfo, Format } from "logform";
import { Primitive } from "utility-types";
import { MessageEmbed } from "discord.js";
export declare const isTransformableInfo: (info: any) => info is TransformableInfo;
export declare const handlePrimitive: (info: Primitive) => string;
export declare const handleLogform: (info: TransformableInfo, level?: string | undefined) => [string, MessageEmbed] | undefined;
export declare const handleObject: (info: Exclude<any, Primitive>, format?: Format | undefined, level?: string | undefined) => string | [string, MessageEmbed] | undefined;
export declare const handleInfo: (info: any, format?: Format | undefined, level?: string | undefined) => string | [string, MessageEmbed] | undefined;
