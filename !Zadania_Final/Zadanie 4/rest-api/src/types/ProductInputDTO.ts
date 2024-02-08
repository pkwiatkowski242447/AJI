import { IItem } from 'interfaces/Item'
import mongoose from 'mongoose'

export type ProductInputDTO = {
    user: mongoose.Schema.Types.ObjectId,
    products: IItem[],
}