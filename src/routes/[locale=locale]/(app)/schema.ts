import * as v from "valibot";

export const userInfoSchema = v.object({
  firstNames: v.pipe(v.string(), v.minLength(1)),
  lastName: v.pipe(v.string(), v.minLength(1)),
  homeMunicipality: v.pipe(v.string(), v.minLength(1)),
});

export type UserInfo = v.InferOutput<typeof userInfoSchema>;
