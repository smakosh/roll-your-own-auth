import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { prisma } from 'src/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  async createUser(userDetails: CreateUserDto): Promise<User> {
    const hashedPasword = await argon2.hash(userDetails.password);

    try {
      const user = await prisma.user.create({
        data: {
          name: userDetails.name,
          email: userDetails.email,
          password: hashedPasword,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
    }
  }

  async findUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
