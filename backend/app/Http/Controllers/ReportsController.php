<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    // USERS REPORT
    public function usersReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Email']);
            $users = DB::table('User')->get();

            foreach ($users as $u) {
                fputcsv($file, [
                    $u->user_ID,
                    $u->user_name,
                    $u->user_email,
                ]);
            }
            fclose($file);
        }, 'users_report.csv', ['Content-Type' => 'text/csv']);
    }

    // DONATIONS REPORT
    public function donationsReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Donation ID', 'Donor ID', 'Charity ID', 'Donation Date', 'Total Items']);

            $donations = DB::table('Donation')->get();

            foreach ($donations as $d) {
                // this counts items from Donation_Item table
                $itemsCount = DB::table('Donation_Item')
                    ->where('donation_ID', $d->donation_ID)
                    ->count();

                fputcsv($file, [
                    $d->donation_ID,
                    $d->donor_ID,
                    $d->charity_ID,
                    $d->donation_date,
                    $itemsCount,
                ]);
            }
            fclose($file);
        }, 'donations_report.csv', ['Content-Type' => 'text/csv']);
    }

    // CHARITIES REPORT
    public function charitiesReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Charity ID', 'Name', 'Contact', 'Email', 'Address', 'Total Donations', 'Total Items']);

            $charities = DB::table('Charity')->get();

            foreach ($charities as $c) {
                $donationsReceived = DB::table('Donation')
                    ->where('charity_ID', $c->charity_ID)
                    ->get();

                $totalDonations = $donationsReceived->count();

                // count all items for this charity
                $totalItems = DB::table('Donation_Item')
                    ->whereIn('donation_ID', $donationsReceived->pluck('donation_ID'))
                    ->count();

                fputcsv($file, [
                    $c->charity_ID,
                    $c->charity_name,
                    $c->contact_person,
                    $c->charity_email,
                    $c->charity_address,
                    $totalDonations,
                    $totalItems,
                ]);
            }

            fclose($file);
        }, 'charity_report.csv', ['Content-Type' => 'text/csv']);
    }

    // SUSTAINABILITY REPORT
    public function sustainabilityReport()
    {
        return response()->streamDownload(function () {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Total CO₂ Reduced (kg)']);

            // count all donation items
            $totalItems = DB::table('Donation_Item')->count();
            $totalCO2 = $totalItems * 1.5;

            fputcsv($file, [$totalCO2]);
            fclose($file);
        }, 'sustainability_report.csv', ['Content-Type' => 'text/csv']);
    }
}
