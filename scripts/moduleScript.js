// This is an intermediate step to allow things to be progressively moved over to using modules

import { gameBanner as gameBanner_ } from "./gameBanner.js";
window.gameBanner = gameBanner_;

import { averageColor as averageColor_, multiplyColor as multiplyColor_ } from "//www.colebot.com/colors.js";
window.averageColor = averageColor_;
window.multiplyColor = multiplyColor_;