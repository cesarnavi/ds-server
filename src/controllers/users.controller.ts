import { Request, Response } from "express"
import { ROLES, User } from "../models";
import { ObjectId } from "mongodb";
import { authorization, authentication, generateJWT } from "../middlewares";
import { onError } from "../utils";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeStr = (str:string)=>str.toLowerCase().trim();

export async function createUser(req: Request, res: Response) {
  let {
    username,
    email,
    role
  } = req.body;

  if (!email) {
    return onError(res, "Email is required");
  }
  if (!username) {
    return onError(res, "Username is required");
  }
  if(!role) {
    return onError(res, "Role is required");
  }

  role = role.toUpperCase();

  if(!Object.values(ROLES).includes(role.toUpperCase())){
    return onError(res, "Invalid role");
  }
 
  if(!emailRegex.test(email)) {
    return onError(res, "Invalid email format");
  }
  //Verify admin role creation, only admins can create admin users
  if(role == ROLES.ADMIN){
    await authentication(req,res, ()=>{});
    if(res.headersSent) return; // Stops route execution if auth fails
    authorization(ROLES.ADMIN)(req,res,()=>{});
    if(res.headersSent) return;
  }

  email = email ? normalizeStr(email) : null;
  username = username ? normalizeStr(username) : null;

  let alreadyExistEmail = await User.countDocuments({ email: email });
  if (alreadyExistEmail) {
    return onError(res, "Email already exists");
  }

  let alreadyExistUsername = await User.countDocuments({ username: username });
  if (alreadyExistUsername) {
    return onError(res, "Username already exists");
  }
  
  let user = null;
  try {
    user = await new User({
      _id: new ObjectId(),
      email,
      username,
      role,
    }).save();
  } catch (e) {
    console.log("[Users] Error upserting user: ", e.message);
    return res.status(400).send({ message: "Error upserting user, please contact support" });
  }
  console.log(" [Users] Created successfully: ", user);
  // Generate and sign a JWT that is valid for one hour.
  const token = generateJWT({ 
    _id: user._id, 
    username: user.username, 
    role: user.role 
}, 60*60);

  return res.status(200).send({
    token,
    username: user.username, 
    role: user.role 
  });
}

export async function getUsers(req: Request, res: Response) {

  const users =  await User.find({},null,{lean: true})
  return res.status(200).send(users);
}

export async function deleteUserById(req: Request, res: Response){
  const { userId } = req.params;
  if(!userId){
    return onError(res, "Invalid ID");
  }
 
  const user = await User.findOne({ id: userId });
  if(!user){
    return onError(res,"User not found");
  }

  await User.deleteOne({
    id: userId
  })
  

  return res.status(202).send("ok");

}
