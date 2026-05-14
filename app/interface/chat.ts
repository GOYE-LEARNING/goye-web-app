export interface SelectedUser {
  id: string;
  name: string;
}

export interface ChatLayoutProps {
  showPrivateMessages: boolean;
  showGeneralContainer: boolean;
  selectedUser: SelectedUser | null;
  onOpenPrivateMessage: (userId: string, userName: string) => void;
  onClosePrivateMessage: () => void;
}

export interface GeneralSectionProps {
  visible: boolean;
}

export interface ChatRoomSectionProps {
  visible: boolean;
  selectedUser: SelectedUser | null;
  onClose: () => void;
}

export interface SidebarSectionProps {
  onOpenPrivateMessage: (userId: string, userName: string) => void;
}