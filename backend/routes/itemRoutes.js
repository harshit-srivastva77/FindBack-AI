
import express from "express";
import mongoose from "mongoose";
import Item from "../models/Item.js";

const router = express.Router();

// Get all lost and found items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
    });
  }
});

// Report a new lost or found item
router.post("/", async (req, res) => {
  try {
    const { type, name, category, location, date, description, image } = req.body;

    const newItem = await Item.create({
      type,
      name,
      category,
      location,
      date,
      description,
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Item reported successfully",
      item: newItem,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete an item
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
});

export default router;
