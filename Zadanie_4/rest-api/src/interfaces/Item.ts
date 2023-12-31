import mongoose from 'mongoose';

// Interface definition for Item

// Item is a interface that connects product id with ammount of that product together, bought by the client.

export interface IItem {
    productId: mongoose.Schema.Types.ObjectId,
    productCount: number,
}