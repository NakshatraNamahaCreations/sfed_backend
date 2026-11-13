import Shipping from "../models/shipping.model.js";
import mongoose from "mongoose";

// Uses a transaction when MongoDB supports it (replica set / Atlas). A plain
// local mongod doesn't, so there the same steps run without one.
const runInTransaction = async (work) => {
    const session = await mongoose.startSession();
    try {
        let result;
        await session.withTransaction(async () => {
            result = await work(session);
        });
        return result;
    } catch (error) {
        const noTxn = error?.code === 20 || /replica set member or mongos/i.test(error?.message || "");
        if (!noTxn) throw error;
        return work(null);
    } finally {
        await session.endSession();
    }
};

export const createShippingService = async ({ name, minOrderValue, maxOrderValue, shippingFee }) => {
    const exist = await Shipping.findOne({ minOrderValue });
    if (exist) {
        throw new Error("This Min Order value already exist in an shipping Fee ");
    };

    const allShipping = await Shipping.find().lean();
    if (allShipping.length === 0 && minOrderValue > 0) {
        throw new Error("Minimum order value not be greater than 0 for first shippeng");

    }

    const lastShipping = await Shipping.findOne().sort({
        minOrderValue: -1
    })
    if (lastShipping) {
        if (lastShipping.maxOrderValue === undefined) {
            throw new Error(
                "Cannot create another range after an open ended range"
            );
        };
        if (lastShipping.maxOrderValue + 1 !== minOrderValue) {
            throw new Error(
                "Minimum order value must be exactly 1 greater than the current maximum order value"
            );
        }
    }
    const shipping = await Shipping.create({
        name, minOrderValue, maxOrderValue, shippingFee
    });

    return {
        message: "shipping created",
        data: {
            shipping
        }
    }

}

export const getShippinService = async ({ page = 1, limit = 5 }) => {
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;
    const shipping = await Shipping.find().sort({ minOrderValue: 1 }).skip(skip).limit(limit);
    return {
        message: "shipping fetch successfully",
        data: {
            shipping
        }
    }
}
export const updateShippinByIdService = async (
    Id,
    { name, minOrderValue, maxOrderValue, shippingFee }
) => {

    return runInTransaction(async (session) => {

        const currentShipping = await Shipping
            .findById(Id)
            .session(session);

        if (!currentShipping) {
            throw new Error("This Shipping not found");
        }

        const oldMin = currentShipping.minOrderValue;

        const previousDocument = await Shipping.findOne({
            minOrderValue: {
                $lt: oldMin
            }
        })
            .sort({ minOrderValue: -1 })
            .session(session);

        if (previousDocument) {

            previousDocument.maxOrderValue = minOrderValue - 1;

            await previousDocument.save({ session });
        }

        const nextDocument = await Shipping.findOne({
            minOrderValue: {
                $gt: oldMin
            }
        })
            .sort({ minOrderValue: 1 })
            .session(session);

        if (nextDocument) {

            if (maxOrderValue === undefined) {
                throw new Error(
                    "Maximum order value is required when another shipping range exists"
                );
            }

            nextDocument.minOrderValue = maxOrderValue + 1;

            await nextDocument.save({ session });
        }

        currentShipping.name = name;
        currentShipping.minOrderValue = minOrderValue;
        currentShipping.maxOrderValue = maxOrderValue;
        currentShipping.shippingFee = shippingFee;

        await currentShipping.save({ session });

        return {
            message: "Shipping updated successfully",
            data: {
                shipping: currentShipping
            }
        };

    });
};

export const deleteShippingByIdService = async (Id) => {

    return runInTransaction(async (session) => {

        const currentShipping = await Shipping
            .findById(Id)
            .session(session);

        if (!currentShipping) {
            throw new Error("This Shipping not found");
        }

        const oldMin = currentShipping.minOrderValue;

        const previousDocument = await Shipping.findOne({
            minOrderValue: {
                $lt: oldMin
            }
        })
            .sort({ minOrderValue: -1 })
            .session(session);

        if (previousDocument) {

            previousDocument.maxOrderValue = currentShipping.maxOrderValue;

            await previousDocument.save({ session });
        } else {
            const nextDocument = await Shipping.findOne({
                minOrderValue: {
                    $gt: oldMin
                }
            })
                .sort({ minOrderValue: 1 })
                .session(session);

            if (nextDocument) {

                nextDocument.minOrderValue = currentShipping.minOrderValue;

                await nextDocument.save({ session });
            }
        }




   await currentShipping.deleteOne({ session });

        return {
        message: "Shipping deleted successfully",
            data: {
                shipping: currentShipping
            }
        };

    });
};
