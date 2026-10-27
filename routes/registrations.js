
const express = require("express");
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const router = express.Router();

function amount(price, code) {

    if (!code) return price;

    if (code === "CAMPUS50") return price / 2;

    if (code === "EARLYBIRD") return Math.max(0, price - 100);

    throw new Error("Invalid discount code");

}

function error(res, e) {
    if (e.code === 11000)
            return res.status(409).json({ message:  "Email already registered" });

    if (e.name === "ValidationError") {
        return res.status(400).json({
            errors: Object.values(e.errors).map(err =>  err.message)
        });
    }

    if (e.message === "Invalid discount code" ||
        e.message === "Discount code must be a string")
        return res.status(400).json({  errors: [e.message] });

    res.status(500).json({ message: "Server error" });
}

function normalize(d) {
    if (d.discountCode !== undefined &&  d.discountCode !== null) {
        if (typeof d.discountCode !== "string")
            throw new Error("Discount code must be a string");
         d.discountCode = d.discountCode.trim().toUpperCase();
    }
    d.finalAmount = amount(d.ticketPrice, d.discountCode);
}

router.post("/", async (req, res) => {
    try {
        const d = { ...req.body };
        normalize(d);
        res.status(201).json(await Registration.create(d));
    } catch (e) { error(res, e); }
});

router.get("/", async (req, res) => {
    try {
        res.json(await Registration.find({
            ...(req.query.eventType && { eventType: req.query.eventType }),
            ...(req.query.status && { status: req.query.status })
        }));
    } catch (e) { error(res, e); }
});
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const d = await Registration.findById(req.params.id);
        res.status(d ? 200 : 404).json(d || { message: "Not found" });
    } catch (e) { error(res, e); }
});

router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ message: "Invalid ID" });

        const d = await Registration.findById(req.params.id);
        if (!d) return res.status(404).json({ message: "Not found" });

        Object.assign(d, req.body);
        normalize(d);
        await d.save();
        res.json(d);
    } catch (e) { error(res, e); }
});

router.delete("/:id", async (req, res) => {
    try {
        if ( !mongoose.isValidObjectId(req.params.id))
            return  res.status(400).json({ message: "Invalid ID" });


        const d =  await Registration.findByIdAndDelete(req.params.id);
        res.status(d ?  200 : 404).json({
            message: d  ? "Deleted" : "Not found"
        });
    } catch (e) {  error(res,  e); }
});

module.exports =   router;
