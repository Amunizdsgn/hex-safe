import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFinancialContext } from '@/contexts/FinancialContext';

export function useExportData() {
    const [isExporting, setIsExporting] = useState(false);
    const { user } = useFinancialContext();
    const supabase = createClient();

    const exportData = async () => {
        if (!user) return;
        setIsExporting(true);

        try {
            // 1. Define tables to export
            const tables = [
                'profiles',
                'accounts',
                'transactions',
                'investments',
                'goals',
                'tasks',
                'clients',
                'deals',
                'channels',
                'services',
                'water_logs',
                'code_snippets'
            ];

            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {}
            };

            // 2. Fetch all data in parallel
            const promises = tables.map(async (table) => {
                let query = supabase.from(table).select('*');

                // Profiles usually use 'id' as the primary key referencing auth.users
                if (table === 'profiles') {
                    query = query.eq('id', user.id);
                } else {
                    query = query.eq('user_id', user.id);
                }

                const { data, error } = await query;

                if (error) {
                    console.error(`Error exporting ${table}:`, error);
                    return { table, data: [] };
                }
                return { table, data: data || [] };
            });

            const results = await Promise.all(promises);

            results.forEach(({ table, data }) => {
                backupData.data[table] = data;
            });

            // 3. Create JSON Blob
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // 4. Trigger Download
            // Safe filename for all OS (no colons)
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
            const a = document.createElement('a');
            a.href = url;
            a.download = `hex_safe_backup_${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Export failed:', err);
            alert('Falha ao exportar dados. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    return { exportData, isExporting };
}
