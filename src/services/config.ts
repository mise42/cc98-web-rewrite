import { apiClient } from "./client";
import type { IIndex, IAdvertisement } from "@/types/config";

export const configService = {
  /**
   * 获取首页配置信息
   */
  async getIndex(): Promise<IIndex> {
    return apiClient.get<IIndex>("/config/index");
  },

  /**
   * 获取全局广告
   */
  async getAdvertisement(): Promise<IAdvertisement[]> {
    return apiClient.get<IAdvertisement[]>("/config/global/advertisement");
  },
};
