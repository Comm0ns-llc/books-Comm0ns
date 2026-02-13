export type UserStatus = "unverified" | "active";

export type RelationshipType =
  | "family"
  | "friend"
  | "housemate"
  | "colleague"
  | "mentor"
  | "community"
  | "other";

export type PlaceType = "home" | "share_house" | "office" | "community_space" | "other";

export type PlaceMemberRole = "admin" | "member";

export type UserProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  status: UserStatus;
};
