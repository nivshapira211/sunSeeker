"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendation = void 0;
const aiService_1 = require("../services/aiService");
const getRecommendation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q;
    if (!query) {
        res.status(400).json({ message: 'Query parameter "q" is required' });
        return;
    }
    try {
        const recommendation = yield (0, aiService_1.getRecommendations)(query);
        res.json({ recommendation });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching recommendation' });
    }
});
exports.getRecommendation = getRecommendation;
