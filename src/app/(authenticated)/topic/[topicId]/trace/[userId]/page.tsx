'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const params = useParams()
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId

  useEffect(() => {
    if (topicId) {
      router.replace(`/topic/${topicId}`)
    }
  }, [router, topicId])

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <div className="text-center text-muted-foreground">正在加载...</div>
    </div>
  )
}
