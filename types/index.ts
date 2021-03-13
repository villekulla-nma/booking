export interface GroupAttributes {
  id: string;
  name: string;
}

export interface ResourceAttributes {
  id: string;
  name: string;
}

export interface UserAttributes {
  id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  group: string;
}
