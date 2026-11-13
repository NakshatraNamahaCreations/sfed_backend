import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

// admin
export const createUserByAdminService = async (data) => {
    const exist=await User.findOne({email:data.email});
    if (exist) {
        throw new Error("Email already register");
    };
    const hashed = await bcrypt.hash(data.password,10);
   
       const user=await User.create({
           name:data.name,
           email:data.email,
           phone:data.phone,
           role:data.role,
           password:hashed
       });

    return{
        message:"User created",
        user
    }
}
export const getUserService=async ({page=1,limit=10,role}) => {
page=Number(page);
limit=Number(limit);
const skip=(page-1)*limit
    const filter={};
    if (role==="admin") {
        filter.role=role
    };
    if (role==="user") {
        filter.role=role
    }
    
    const user = await User.find(filter).skip(skip).limit(limit);
      return {
        message: "Users fetched successfully",
        data: {
            user
        }
    };
}


export const updateUserService = async (id, data) => {

    if (data.password) {
        throw new Error("password not be change");

    }
    const user = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })
    if (!user) {
        throw new Error("user not found");
    }
    return {
        message: `successfully updated the user:${user.name}`,
        data: {
            user
        }
    }

}


// user access

export const updateUserByUserService = async (userId,{name,phone,image}) => {

  const exist = await User.findById(userId);
  if (!exist) {
    throw new Error("user not found");
  };

  const oldImagePublicId=exist.imagePublicId;
  const user= await User.findByIdAndUpdate(userId,{name,phone,image})

  if (image && oldImagePublicId) {
        await cloudinary.uploader.destroy(oldImagePublicId);
    }
    return {
        message: `successfully updated the user:${user.name}`,
        data: {
            user
        }
    }

}

export const getUserByIdService=async (Id) => {
    const user = await User.findById(Id);

       return {
        message: `successfully fetch the user:${user.name}`,
        data: {
            user
        }
    }
}