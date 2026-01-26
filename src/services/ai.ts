
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

export async function optimizeTaskWithAI(content: string): Promise<string> {
  if (!content.trim()) return content;
  if (!API_KEY) {
    throw new Error('DeepSeek API Key 未配置');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个高效的任务管理助手。请优化用户输入的待办事项描述，使其更简洁、准确、流畅、行动导向。直接返回优化后的文本，不要包含任何解释、引号或额外标点。如果输入已经很完美，则原样返回。'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const optimizedContent = data.choices[0]?.message?.content?.trim();
    
    return optimizedContent || content;
  } catch (error) {
    console.error('AI Optimization Error:', error);
    throw error;
  }
}
