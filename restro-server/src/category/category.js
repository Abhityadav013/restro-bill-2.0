const express = require("express");
const router = express.Router();
const Category = require("./model/category.model");
const { authMiddleware } = require("../auth/auth");

/**
 * @swagger
 * /api/category:
 *   get:
 *     tags:
 *       - Category
 *     summary: Get all Categories
 *     description: Retrieves all categories from the system.
 *     responses:
 *       200:
 *         description: A list of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier (UUID) for the category
 *                     example: "fa9d8f6c-d849-4af5-bc59-bb7b44b57e79"
 *                   categoryId:
 *                     type: string
 *                     description: A unique ID for the category
 *                     example: "CAT123"
 *                   categoryName:
 *                     type: string
 *                     description: Name of the category
 *                     example: "Appetizers"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the category was created
 *                     example: "2025-02-04T10:00:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the category was last updated
 *                     example: "2025-02-04T10:00:00.000Z"
 *       404:
 *         description: No categories found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No category found
 *       400:
 *         description: Error fetching categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching category
 *                 error:
 *                   type: string
 *                   example: An error message describing the issue
 */


router.get("/category",async (req, res) => {
    try {
      const category = await Category.find();
      if (category.length === 0) {
        return res.status(404).json({
          message: "No category found",
        });
      }
  
      res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category: ", error);
      res.status(400).json({
        message: "Error fetching category",
        error: error.message,
      });
    }
  });
  module.exports = router;