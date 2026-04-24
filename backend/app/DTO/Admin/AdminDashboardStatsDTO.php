<?php

namespace App\DTO\Admin;

class AdminDashboardStatsDTO
{
    public function __construct(
        public int $total_announcements,
        public int $active_announcements,
        public int $pending_moderation,
        public int $new_users_today,
        public array $donation_trends = [],
        public array $user_trends = [],
    ) {}

    public function toArray(): array
    {
        return [
            'total_announcements' => $this->total_announcements,
            'active_announcements' => $this->active_announcements,
            'pending_moderation' => $this->pending_moderation,
            'new_users_today' => $this->new_users_today,
            'donation_trends' => $this->donation_trends,
            'user_trends' => $this->user_trends,
        ];
    }
}
