import mongoose from 'mongoose';
import './user.js';
import generateID from '../Utils/idGenertor.js';


const notificationSchema = new mongoose.Schema(
    {
        notificationID:{
            type:String,
            required:true,
            unique:true,
            default : function(){
                return "notiID"+generateID();
             }
            },
            title:{
                type:String,
                required:true,
                trim:true
            },
            body:{
                type:String,
                required:true,
            },
            type:{
                type:String,
                required:true,
                enum:["general","complaint_update","emergency_alert"],
                default:"general"
            },
            status:{
                type:String,
                enum:["unread","read","archived","overdue"],
                default:"unread"
            },
            deliveredTo:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            sendDate:{
                type:Date,
                default:Date.now
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
    }
    
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
