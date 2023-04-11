import type { User } from "@clerk/nextjs/dist/api";


// filter out sensitive data from the user object

export const filterUserforClient = (user: User) => {
  console.log(user);
  return {id: user.id, username: user.username, profileImageUrl: user.profileImageUrl, firstName: user.firstName,};
} 
