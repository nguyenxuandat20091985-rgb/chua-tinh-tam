/**
 * Bảng Quy Tắc Tương Tác TikTok Live – Chùa Tịnh Tâm
 * Map sự kiện → nghi thức + điểm công đức
 */

export type RitualId =
  | 'go_mo'
  | 'thinh_chuong'
  | 'thap_huong'
  | 'tha_den'
  | 'xin_xam'
  | 'dang_mam'
  | 'hoa_sen'
  | 'dai_le_kim_long'
  | 'song_phat_tu'
  | 'none';

export interface RuleResult {
  ritual: RitualId;
  merit: number;
  label: string;
  detail: string;
}

export interface GiftTier {
  minXu: number;
  maxXu: number;
  ritual: RitualId;
  meritPerXu: number;
  label: string;
}

/** Từ khóa bình luận → nghi thức */
export const KEYWORD_RULES: { keywords: string[]; ritual: RitualId; merit: number; label: string; detail: string }[] = [
  {
    keywords: ['thắp hương', 'thap huong', 'dâng hương', 'dang huong', 'bái phật', 'bai phat', 'lạy phật', 'lay phat'],
    ritual: 'thap_huong',
    merit: 15,
    label: 'Thắp hương',
    detail: 'Phật tử bước dọc thảm đỏ lên trước Lư Hương, quỳ đảnh lễ 3 lạy + Đọc tên khấn',
  },
  {
    keywords: ['cầu', 'nguyện', 'nam mô', 'nam mo', 'a di đà', 'a di da', 'bình an', 'binh an', 'chúc'],
    ritual: 'tha_den',
    merit: 10,
    label: 'Cầu nguyện',
    detail: 'Bước lên đảnh lễ + Thả Đèn Hoa Đăng mang lời khấn bay lên trời + Đọc lời cầu nguyện',
  },
  {
    keywords: ['xin xăm', 'xin xam', 'gieo quẻ', 'gieo que', 'rút quẻ', 'rut que', 'quẻ', 'que'],
    ritual: 'xin_xam',
    merit: 10,
    label: 'Xin xăm / Gieo quẻ',
    detail: 'Lắc ống xăm + Mở tờ Giải Quẻ đồng bộ đúng lúc giọng đọc bắt đầu vang lên',
  },
  {
    keywords: ['gõ mõ', 'go mo', 'mõ'],
    ritual: 'go_mo',
    merit: 5,
    label: 'Gõ mõ',
    detail: 'Gõ mõ gỗ tụng kinh',
  },
  {
    keywords: ['thỉnh chuông', 'thinh chuong', 'chuông', 'chuong'],
    ritual: 'thinh_chuong',
    merit: 10,
    label: 'Thỉnh Đại Hồng Chung',
    detail: 'Thỉnh Đại Hồng Chung ngân vang + Sóng âm vàng',
  },
];

export const GIFT_TIERS: GiftTier[] = [
  {
    minXu: 1,
    maxXu: 4,
    ritual: 'hoa_sen',
    meritPerXu: 20,
    label: 'Tặng quà Nhỏ (1–4 xu)',
  },
  {
    minXu: 5,
    maxXu: 99,
    ritual: 'dang_mam',
    meritPerXu: 30,
    label: 'Tặng quà Vừa (5–99 xu)',
  },
  {
    minXu: 100,
    maxXu: Infinity,
    ritual: 'dai_le_kim_long',
    meritPerXu: 50,
    label: 'Tặng quà Lớn (≥100 xu)',
  },
];

export function processLike(): RuleResult {
  return {
    ritual: 'go_mo',
    merit: 1,
    label: 'Thả tim (Like)',
    detail: 'Gõ mõ gỗ tụng kinh + Làn sóng Phật tử vái lạy',
  };
}

export function processFollowOrShare(): RuleResult {
  return {
    ritual: 'thinh_chuong',
    merit: 10,
    label: 'Follow / Share',
    detail: 'Thỉnh Đại Hồng Chung ngân vang + Sóng âm vàng',
  };
}

export function processComment(text: string): RuleResult | null {
  const lower = text.toLowerCase().normalize('NFC');
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return {
        ritual: rule.ritual,
        merit: rule.merit,
        label: rule.label,
        detail: rule.detail,
      };
    }
  }
  return null;
}

export function processGift(xu: number): RuleResult {
  const tier = GIFT_TIERS.find((t) => xu >= t.minXu && xu <= t.maxXu) || GIFT_TIERS[0];
  return {
    ritual: tier.ritual,
    merit: Math.round(xu * (tier.meritPerXu / 10)), // scale: e.g. 20/xu style points
    label: tier.label,
    detail:
      tier.ritual === 'hoa_sen'
        ? 'Bước lên dâng Đài Hoa Sen Vàng + Thắp 3 nén hương + Đọc lời cảm tạ'
        : tier.ritual === 'dang_mam'
          ? 'Dâng Đèn Lưu Ly / Mâm Ngũ Quả + Thỉnh Chuông + Đọc lời chúc phúc'
          : 'Đại Lễ Kim Long Chầu Phật: Mưa hoa sen vàng, Hào quang vạn trượng, Chuông đồng ngân vang',
  };
}

export const RITUAL_LABELS: Record<RitualId, string> = {
  go_mo: 'Gõ Mõ',
  thinh_chuong: 'Thỉnh Đại Hồng Chung',
  thap_huong: 'Thắp 3 Nén Hương',
  tha_den: 'Thả Đèn Hoa Đăng',
  xin_xam: 'Xin Xăm / Gieo Quẻ',
  dang_mam: 'Dâng Mâm Ngũ Quả',
  hoa_sen: 'Dâng Hoa Sen Vàng',
  dai_le_kim_long: 'Đại Lễ Kim Long Chầu Phật',
  song_phat_tu: 'Làn sóng Phật tử vái lạy',
  none: '—',
};
