import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { generateIdiomsFromHandbook, syncTechCards } from './syncTechCards.mjs';

async function withTempWorkspace(fn) {
  const root = await mkdtemp(path.join(tmpdir(), 'bytebite-sync-'));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeFeature(root, name, content) {
  const featuresDir = path.join(root, 'handbook', 'data', 'features');
  await mkdir(featuresDir, { recursive: true });
  await writeFile(path.join(featuresDir, `${name}.yaml`), content, 'utf8');
}

describe('tech-cards handbook sync', () => {
  it('generates ByteBite idioms from ready YAML feature implementations', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'string-interpolation',
        `id: string-interpolation
source: tech-cards-handbook
title: 字符串插值
description: 在字符串中嵌入变量或表达式的值。
category: 字符串处理
difficulty: beginner
paradigms:
  - 过程式
tags:
  - 字符串
  - 格式化
coverage:
  required:
    - python
    - swift
implementations:
  python:
    status: ready
    sourceCard: chapters/python/string-interpolation.md
    code: |
      name = "Alice"
      print(f"Hello, {name}")
    explanation: Python 使用 f-string 表达字符串插值。
    designRationale: f-string 让表达式直接嵌入字符串，兼顾可读性和类型的运行时语义。
    pros:
      - 简洁
  swift:
    status: ready
    sourceCard: chapters/swift/swift-string-interpolation.md
    code: |
      let name = "Alice"
      print("Hello, \\(name)")
    explanation: Swift 使用 \\(value) 在字符串中插入表达式。
  go:
    status: draft
    code: |
      fmt.Sprintf("Hello, %s", name)
    explanation: 草稿不会进入 ByteBite。
`
      );

      const idioms = await generateIdiomsFromHandbook({
        handbookDir: path.join(root, 'handbook'),
        knownLanguageIds: ['python', 'swift', 'go'],
      });

      expect(idioms).toHaveLength(1);
      expect(idioms[0]).toMatchObject({
        id: 'string-interpolation',
        title: '字符串插值',
        description: '在字符串中嵌入变量或表达式的值。',
        category: '字符串处理',
        difficulty: 'beginner',
        paradigms: ['过程式'],
        tags: ['字符串', '格式化'],
      });
      expect(idioms[0].implementations).toHaveLength(2);
      expect(idioms[0].implementations.map((item) => item.languageId)).toEqual([
        'python',
        'swift',
      ]);
      expect(idioms[0].implementations[0]).toMatchObject({
        languageId: 'python',
        explanation: 'Python 使用 f-string 表达字符串插值。',
        sourceCard: 'chapters/python/string-interpolation.md',
      });
      expect(idioms[0].implementations[0].code).toContain('f"Hello, {name}"');
    });
  });

  it('fails fast when a required language is missing and not marked notApplicable', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'async-await',
        `id: async-await
title: 异步等待
description: 用顺序代码形态表达异步流程。
category: 异步编程
difficulty: intermediate
paradigms:
  - 并发
tags:
  - async
coverage:
  required:
    - python
    - swift
implementations:
  python:
    status: ready
    code: |
      await fetch_user()
    explanation: Python 用 await 等待协程结果。
`
      );

      await expect(
        generateIdiomsFromHandbook({
          handbookDir: path.join(root, 'handbook'),
          knownLanguageIds: ['python', 'swift'],
        })
      ).rejects.toThrow('async-await is missing required implementation for swift');
    });
  });

  it('rejects feature files that mention unknown language ids', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'pattern-matching',
        `id: pattern-matching
title: 模式匹配
description: 按结构匹配并解构数据。
category: 控制流
difficulty: intermediate
paradigms:
  - 函数式
tags:
  - match
coverage:
  required:
    - python
implementations:
  python:
    status: ready
    code: |
      match value:
        case {"kind": "ok"}:
          pass
    explanation: Python 使用 match/case 做结构化匹配。
  elixir:
    status: ready
    code: |
      {:ok, value} = result
    explanation: Elixir 广泛使用模式匹配。
`
      );

      await expect(
        generateIdiomsFromHandbook({
          handbookDir: path.join(root, 'handbook'),
          knownLanguageIds: ['python'],
        })
      ).rejects.toThrow('pattern-matching: unknown language id elixir');
    });
  });

  it('rejects duplicate feature ids before writing generated data', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'error-handling-a',
        `id: error-handling
title: 错误处理
description: 处理可能失败的操作。
category: 错误处理
difficulty: beginner
paradigms:
  - 过程式
tags:
  - 错误
coverage:
  required:
    - go
implementations:
  go:
    status: ready
    code: |
      if err != nil { return err }
    explanation: Go 使用显式 error 返回值。
`
      );
      await writeFeature(
        root,
        'error-handling-b',
        `id: error-handling
title: 重复错误处理
description: 重复的 feature id 应被拒绝。
category: 错误处理
difficulty: beginner
paradigms:
  - 过程式
tags:
  - 错误
coverage:
  required:
    - go
implementations:
  go:
    status: ready
    code: |
      return err
    explanation: 重复卡片不应覆盖前一张卡片。
`
      );

      await expect(
        generateIdiomsFromHandbook({
          handbookDir: path.join(root, 'handbook'),
          knownLanguageIds: ['go'],
        })
      ).rejects.toThrow('duplicate feature id error-handling');
    });
  });

  it('preserves legacy ByteBite idioms that have not been migrated yet', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'string-interpolation',
        `id: string-interpolation
title: 字符串插值
description: 在字符串中嵌入变量或表达式的值。
category: 字符串处理
difficulty: beginner
paradigms:
  - 过程式
tags:
  - 字符串
coverage:
  required:
    - python
implementations:
  python:
    status: ready
    code: |
      print(f"Hello, {name}")
    explanation: Python 使用 f-string。
`
      );
      const bytebiteDir = path.join(root, 'bytebite');
      await mkdir(path.join(bytebiteDir, 'src', 'data'), { recursive: true });
      await writeFile(
        path.join(bytebiteDir, 'src', 'data', 'idioms.json'),
        JSON.stringify([
          { id: 'legacy-only', title: '旧内容', implementations: [] },
          { id: 'string-interpolation', title: '旧字符串插值', implementations: [] },
        ]),
        'utf8'
      );

      await syncTechCards({
        handbookDir: path.join(root, 'handbook'),
        bytebiteDir,
        knownLanguageIds: ['python'],
        preserveLegacy: true,
      });

      const generated = JSON.parse(
        await readFile(path.join(bytebiteDir, 'src', 'data', 'idioms.json'), 'utf8')
      );
      expect(generated.map((item) => item.id)).toEqual([
        'legacy-only',
        'string-interpolation',
      ]);
      expect(generated.find((item) => item.id === 'string-interpolation').title).toBe(
        '字符串插值'
      );
    });
  });

  it('keeps existing ByteBite idioms when the optional handbook checkout is unavailable', async () => {
    await withTempWorkspace(async (root) => {
      const bytebiteDir = path.join(root, 'bytebite');
      const outputPath = path.join(bytebiteDir, 'src', 'data', 'idioms.json');
      const existingIdioms = [
        { id: 'legacy-only', title: '旧内容', implementations: [] },
      ];
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(existingIdioms, null, 2)}\n`, 'utf8');

      const idioms = await syncTechCards({
        handbookDir: path.join(root, 'missing-handbook'),
        bytebiteDir,
        knownLanguageIds: ['python'],
        allowMissingHandbook: true,
      });

      expect(idioms).toEqual(existingIdioms);
      expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual(existingIdioms);
    });
  });

  it('writes generated idioms JSON to the ByteBite data directory', async () => {
    await withTempWorkspace(async (root) => {
      await writeFeature(
        root,
        'error-handling',
        `id: error-handling
title: 错误处理
description: 处理可能失败的操作。
category: 错误处理
difficulty: intermediate
paradigms:
  - 过程式
tags:
  - 错误
coverage:
  required:
    - go
implementations:
  go:
    status: ready
    code: |
      value, err := risky()
      if err != nil { return err }
    explanation: Go 使用显式 error 返回值。
`
      );
      const bytebiteDir = path.join(root, 'bytebite');
      await mkdir(path.join(bytebiteDir, 'src', 'data'), { recursive: true });

      await syncTechCards({
        handbookDir: path.join(root, 'handbook'),
        bytebiteDir,
        knownLanguageIds: ['go'],
      });

      const generated = JSON.parse(
        await readFile(path.join(bytebiteDir, 'src', 'data', 'idioms.json'), 'utf8')
      );
      expect(generated).toHaveLength(1);
      expect(generated[0].id).toBe('error-handling');
      expect(generated[0].implementations[0].languageId).toBe('go');
    });
  });
});
