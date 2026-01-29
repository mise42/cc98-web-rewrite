import { openDB } from 'idb'
import type { IUser } from '@/types/api'

/**
 * CC98 IndexedDB Schema
 */
interface CC98Schema {
  userInfo: {
    key: number
    value: IUser
    indexes: {
      name: string
    }
  }
}

/**
 * CC98 数据库对象
 */
export const db = await openDB<CC98Schema>('cc98', 1, {
  upgrade(db) {
    // 创建 userInfo store
    if (!db.objectStoreNames.contains('userInfo')) {
      const userStore = db.createObjectStore('userInfo', {
        keyPath: ['userInfo', 'id'],
      })
      // 为name添加索引
      userStore.createIndex('name', 'userInfo.name')
    }
  },
})

/**
 * 用户缓存操作
 */
export const userCache = {
  /**
   * 获取用户信息
   */
  async get(userId: number): Promise<IUser | undefined> {
    return db.get('userInfo', userId)
  },

  /**
   * 保存用户信息
   */
  async set(user: IUser): Promise<IDBValidKey> {
    return db.put('userInfo', user)
  },

  /**
   * 获取所有用户
   */
  async getAll(): Promise<IUser[]> {
    return db.getAll('userInfo')
  },

  /**
   * 按名称获取用户
   */
  async getByName(name: string): Promise<IUser | undefined> {
    return db.getFromIndex('userInfo', 'name', name)
  },

  /**
   * 删除用户
   */
  async delete(userId: number): Promise<void> {
    return db.delete('userInfo', userId)
  },

  /**
   * 清空所有用户缓存
   */
  async clear(): Promise<void> {
    return db.clear('userInfo')
  },
}
