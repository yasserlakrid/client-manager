import { useRef ,  useEffect, useState } from "react";

function SearchBar({ t , Icon , setSearchQuery , options , setStatusFilter , statusFilter , searchQuery  , handleSearch  }) {
   const timeoutRef = useRef(null);

  function handleSearchInputChange(e) {
    setSearchQuery(e.target.value);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if(handleSearch){
      handleSearch();
      }
    }, 300);
  }

  return (
         <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div className="search-filter-row">
          <div className="search-input-wrapper">
            <Icon size={20} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>
        {options && setStatusFilter && statusFilter !== undefined && (
            <select 
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
                {options.map((option, index) => (
                      <option key={index} value={option.value}>{t[option.label]}</option>
                ))
                }
             </select>
            )
        }
          </div>
          
      </div>
    )
}
export default SearchBar;
