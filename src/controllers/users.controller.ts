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
    return onError(res, "Email es requerido");
  }
  if (!username) {
    return onError(res, "Username es requerido");
  }
  if(!role) {
    return onError(res, "Role es requerido");
  }

  role = role.toUpperCase();

  if(!Object.values(ROLES).includes(role.toUpperCase())){
    return onError(res, "Rol invalido");
  }
 
  if(!emailRegex.test(email)) {
    return onError(res, "Formato de correo invalido");
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
    return onError(res, "Correo ya ha sido registrado");
  }

  let alreadyExistUsername = await User.countDocuments({ username: username });
  if (alreadyExistUsername) {
    return onError(res, "Nombre de usuario ya existe");
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
    _id: user._id,
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
  const { _id } = req.params;
  if(!_id){
    return onError(res, "Invalid ID");
  }
  if(!ObjectId.isValid(_id)){
    return onError(res, "Invalid ObjectID");
  }

  const user = await User.findById(new ObjectId(_id));
  if(!user){
    return onError(res,"Usuario no encontrado");
  }
  if(req["user"]._id == user._id){
    return onError(res,"No puede eliminar su propia cuenta");
  }
  if(!user){
    return onError(res,"Usuario no encontrado");
  }

  await User.deleteOne({
    _id: user._id
  });

  return res.status(202).send("ok");

}

export async function updateUserById(req: Request, res: Response){
  const { _id } = req.params;
  let {
    role,
    username,
    email
  } = req.body;

  if(!_id){
    return onError(res, "Invalid ID");
  }
  if(!ObjectId.isValid(_id)){
    return onError(res, "Invalid ObjectID");
  }

  const user = await User.findById(new ObjectId(_id));
  if(!user){
    return onError(res,"Usuario no encontrado");
  }

  let authUser = req["user"];
  if(authUser.role != ROLES.ADMIN && authUser._id != user._id){
    return onError(res, "Solo puede editar otros usuarios como administrador")
  }

  if(email){
    email = normalizeStr(email)
    let alreadyExistEmail = await User.countDocuments({ email: email });
    if (alreadyExistEmail) {
      return onError(res, "Ya existe el correo");
    }
    user.email = email;
  }

  if(username){
    username = normalizeStr(username);
    let alreadyExistUsername = await User.countDocuments({ username: username });
    if (alreadyExistUsername) {
      return onError(res, "Ya existe nombre de usuario");
    }
    user.username = username;
  }

  if(role){
    role = normalizeStr(role).toUpperCase();
    if(!Object.values(ROLES).includes(role)) return onError(res,"Rol invalido");
    if(role == ROLES.ADMIN && authUser.role != ROLES.ADMIN) return onError(res,"Solo admins pueden cambiar el rol");
    user.role = role;
  }

  await user.save();

  return res.status(202).send(user);
}

