import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { OauthDTO } from 'src/oauth/dto/oauth.dto';
import { SubscriptionEventDTO } from 'src/global/dto/subscription-event.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByOauth(mode: string, id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      'oauthAccounts.provider': mode,
      'oauthAccounts.id': id,
    });
    return user;
  }
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    return user;
  }

  async createByOauth(mode: string, userInfo: OauthDTO): Promise<UserDocument> {
    const user = new this.userModel({
      _id: new Types.ObjectId(),
      oauthAccounts: [{ provider: mode, id: userInfo.id }],
      nickname: userInfo.nickname,
      email: userInfo.email,
      phoneNum: userInfo.phoneNum,
      gender: userInfo.gender,
      age: userInfo.age,
    });
    await user.save();
    return user;
  }

  async addSubscribedCharacter(payload: SubscriptionEventDTO) {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        payload.userId,
        {
          $push: {
            subscribedCharacters: new Types.ObjectId(payload.characterId),
            subscriptionIds: new Types.ObjectId(payload.subscriptionId),
          },
        },
        { new: true },
      )
      .exec();
    return updatedUser;
  }

  async removeUnsubscribedCharacters(
    payload: SubscriptionEventDTO,
  ): Promise<User> {
    // Find the user and update in one step using MongoDB's $pull operator

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        payload.userId,
        {
          $pull: {
            subscribedCharacters: new Types.ObjectId(payload.characterId),
            subscriptionIds: new Types.ObjectId(payload.subscriptionId),
          },
        },
        { new: true }, // Return the updated document
      )
      .exec();

    return updatedUser;
  }
}
