import {
  Favorite,
  Handshake,
  AccountBalance,
  VolunteerActivism,
  AutoAwesome,
  EmojiPeople
} from '@mui/icons-material';

export interface BranchTypeConfig {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const BRANCH_TYPES: BranchTypeConfig[] = [
  { value: 'organ_donation', label: 'Organ Donation', icon: Favorite },
  { value: 'healed_relationship', label: 'Healed Relationship', icon: Handshake },
  { value: 'foundation', label: 'Foundation/Organization', icon: AccountBalance },
  { value: 'charity', label: 'Charity Connection', icon: VolunteerActivism },
  { value: 'inspired_act', label: 'Inspired Act of Kindness', icon: AutoAwesome },
  { value: 'life_touched', label: 'Life Touched/Changed', icon: EmojiPeople },
];

export function getBranchTypeConfig(type: string): BranchTypeConfig | undefined {
  return BRANCH_TYPES.find(bt => bt.value === type);
}
