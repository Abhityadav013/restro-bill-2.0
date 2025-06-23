const express = require("express");
const router = express.Router();
const Menu = require("./model/menu.model");
const { authMiddleware } = require("../auth/auth");

/**
 * @swagger
 * /api/menu:
 *   post:
 *     tags:
 *       - Menu
 *     summary: Create one or more Menu Items
 *     description: Creates one or more menu items with details like item name, price, and category.
 *     security:
 *       - bearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItems
 *             properties:
 *               menuItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - itemName
 *                     - price
 *                     - category
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       example: "1001"
 *                     itemName:
 *                       type: string
 *                       example: "Veg Burger"
 *                     price:
 *                       type: number
 *                       example: 5.99
 *                     category:
 *                       type: string
 *                       example: "Main Course"
 *     responses:
 *       201:
 *         description: Menu items created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu items created successfully"
 *       400:
 *         description: Error creating menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating menu items"
 */
router.post("/menu", authMiddleware,async (req, res) => {
  try {
    const { menuItems } = req.body;  // Extract the array of menu items from the request body

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return res.status(400).json({
        message: "Invalid request, menuItems should be an array with at least one item.",
      });
    }

    // Iterate over the array of menu items and save each one
    for (let item of menuItems) {
      const { itemId, itemName, price, category } = item;

    const existingItem = await Menu.findOne({ itemId });
      if (existingItem) {
        return res.status(400).json({
          message: `Item ID ${itemId} already exists. Please use a unique ID.`,
        });
      }  

      // Create a new menu item object
      const newMenuItem = new Menu({
        itemId,
        itemName,
        price,
        category,
      });

      // Save the new menu item to the database
      await newMenuItem.save();
    }

    // Respond with a success message
    res.status(201).json({
      message: "Menu items created successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating menu items",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/menu:
 *   get:
 *     tags:
 *       - Menu
 *     summary: Get all Menu Item
 *     description: Retrieves all menu items from the system.
 *     responses:
 *       200:
 *         description: A list of all menu item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   itemId:
 *                     type: string
 *                   itemName:
 *                     type: string
 *                   price:
 *                     type: integer
 *                   category:
 *                     type: string
 *       400:
 *         description: Error fetching orders
 */

router.get("/menu",async (req, res) => {
  try {
    const menu = await Menu.find();
    if (menu.length === 0) {
      return res.status(404).json({
        message: "No menu found",
      });
    }

    res.status(200).json(menu);
  } catch (error) {
    console.error("Error fetching menu: ", error);
    res.status(400).json({
      message: "Error fetching menu",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/menu/{itemId}:
 *   delete:
 *     tags:
 *       - Menu
 *     summary: Delete a menu item by ID
 *     description: Deletes a menu item from the database using its unique item ID.
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the menu item to delete
 *         example: "1001"
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item deleted successfully"
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item not found"
 *       400:
 *         description: Error deleting menu item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting menu item"
 */
router.delete("/menu/:itemId",authMiddleware,async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if the item exists
    const existingItem = await Menu.findOne({ itemId });
    if (!existingItem) {
      return res.status(404).json({
        message: `Menu item with ID ${itemId} not found.`,
      });
    }

    // Delete the item
    await Menu.deleteOne({ itemId });

    res.status(200).json({
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting menu item",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/menu/{itemId}:
 *   put:
 *     tags:
 *       - Menu
 *     summary: Update a Menu Item
 *     description: Updates the details of a specific menu item by its `itemId`.
 *     security:
 *       - bearerAuth: [] 
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         description: The ID of the menu item to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *               - price
 *               - category
 *             properties:
 *               itemName:
 *                 type: string
 *                 example: "Updated Burger"
 *               price:
 *                 type: number
 *                 example: 7.99
 *               category:
 *                 type: string
 *                 example: "Main Course"
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item updated successfully"
 *       404:
 *         description: Menu item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu item not found"
 *       400:
 *         description: Error updating menu item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating menu item"
 */
router.put("/menu/:itemId", authMiddleware ,async (req, res) => {
  try {
    const { itemId } = req.params;
    const { itemName, price, category } = req.body;

    // Find the menu item by ID and update it
    const updatedItem = await Menu.findOneAndUpdate(
      { itemId },
      { itemName, price, category },
      { new: true } // Return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json({
      message: "Menu item updated successfully",
      menuItem: updatedItem,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating menu item",
      error: error.message,
    });
  }
});


module.exports = router;
