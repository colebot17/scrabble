// This is an intermediate step to allow things to be progressively moved over to using modules

import { gameBanner as gameBanner_ } from "./gameBanner.js";
window.gameBanner = gameBanner_;

import { averageColor as averageColor_, multiplyColor as multiplyColor_ } from "//www.colebot.com/colors.js";
window.averageColor = averageColor_;
window.multiplyColor = multiplyColor_;

import { toast as toast_ } from "./toast.js";
window.toast = toast_;

import {
    parseWords as parseWords_,
    getUnlockedTiles as getUnlockedTiles_,
    checkConnectedness as checkConnectedness_
} from "./parseWords.js";
window.parseWords = parseWords_;
window.getUnlockedTiles = getUnlockedTiles_;
window.checkConnectedness = checkConnectedness_;