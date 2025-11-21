document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Filter button interactions
    const allFilter = document.querySelector('.filter.active');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    const tableRows = document.querySelectorAll('.table-row');
    
    let activeStageFilter = null;
    let activeCategoryFilter = null;

    // Toggle dropdown menus
    filterDropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.filter-dropdown-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            filterDropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown')) {
            filterDropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // Handle dropdown item clicks
    dropdownMenus.forEach(menu => {
        menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                e.stopPropagation();
                const filterType = e.target.dataset.filter;
                const filterValue = e.target.dataset.value;
                
                // Remove active class from all items in this menu
                menu.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                e.target.classList.add('active');
                
                // Update filter state
                if (filterType === 'stage') {
                    activeStageFilter = filterValue;
                } else if (filterType === 'category') {
                    activeCategoryFilter = filterValue;
                }
                
                // Apply filters
                applyFilters();
            }
        });
    });

    // Handle "All" filter button
    if (allFilter) {
        allFilter.addEventListener('click', () => {
            // Remove active from all dropdown items
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Reset filters
            activeStageFilter = null;
            activeCategoryFilter = null;
            
            // Show all rows
            applyFilters();
        });
    }

    // Apply filters function
    function applyFilters() {
        tableRows.forEach(row => {
            const rowStage = row.dataset.stage;
            const rowCategory = row.dataset.category;
            
            let shouldShow = true;
            
            if (activeStageFilter && rowStage !== activeStageFilter) {
                shouldShow = false;
            }
            
            if (activeCategoryFilter && rowCategory !== activeCategoryFilter) {
                shouldShow = false;
            }
            
            if (shouldShow) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    }

    // Expandable row functionality
    tableRows.forEach(row => {
        const companyCell = row.querySelector('.table-cell.company');
        if (companyCell) {
            row.addEventListener('click', (e) => {
                // Don't toggle if clicking on links in expanded details
                if (e.target.closest('.detail-link')) {
                    return;
                }
                
                // Close other expanded rows
                tableRows.forEach(r => {
                    if (r !== row && r.classList.contains('expanded')) {
                        r.classList.remove('expanded');
                    }
                });
                
                // Toggle current row
                row.classList.toggle('expanded');
            });
        }
    });

});
