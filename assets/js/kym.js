const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyGtE9sjwx4Nb3sh4LYDWiE5JC_FqZtyA74m1K0KDDKvUy0jGz-vX8dU2nRIF9_EKZL/exec";

/* ========================================================================
   1. GLOBAL SEARCH & HELPER FUNCTIONS
   ======================================================================== */

function toggleDateInput() {
  const selectedType = document.querySelector('input[name="date_type"]:checked').value;
  const wrapper = document.getElementById('dob_input_wrapper');
  
  if (selectedType === "AD") {
    wrapper.innerHTML = `
      <label id="dob_label">जन्म मिति AD:</label>
      <input type="date" id="input_dob">
    `;
  } else {
    wrapper.innerHTML = `
      <label id="dob_label">जन्म मिति BS :</label>
      <input type="text" id="input_dob" class="nepali-date-field" placeholder="उदा: 2038/06/12" maxlength="10">
    `;
  }
}

async function searchMemberCode() {
  const name = document.getElementById('input_name').value;
  const dob = document.getElementById('input_dob').value;
  const dobType = document.querySelector('input[name="date_type"]:checked').value;
  const citizenship = document.getElementById('input_citizenship').value;
  const outputDiv = document.getElementById('search-results-output');

  if (!name && !dob && !citizenship) {
    outputDiv.innerHTML = "<p class='error-msg'>कृपया सदस्यता नं. खोज्न माथिका सबै विवरण भर्नुहोस्।</p>";
    return;
  }

  outputDiv.innerHTML = "<p class='loading-msg'>खोज्दैछ... (Searching...)</p>";

  const queryParams = new URLSearchParams({ name, dob, dob_type: dobType, citizenship_no: citizenship });

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?${queryParams.toString()}`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      let htmlTable = `
        <table class='results-table'>
          <thead>
            <tr><th>Member Code (सदस्यता नम्बर)</th><th>Name (नाम)</th><th>Citizenship No</th></tr>
          </thead>
          <tbody>
      `;
      result.data.forEach(member => {
        htmlTable += `
          <tr data-kyc-id="${member.kyc_id}">
            <td><strong class="highlight-code">${member.membership_code}</strong></td>
            <td>${member.name}</td>
            <td>${member.citizenship_no || '-'}</td>
          </tr>
        `;
      });
      htmlTable += "</tbody></table>";
      outputDiv.innerHTML = htmlTable;
      attachRowSelectionListeners();
    } else {
      outputDiv.innerHTML = "<p class='no-results-msg'>कुनै सदस्य फेला परेन।</p>";
    }
  } catch (error) {
    outputDiv.innerHTML = "<p class='error-msg'>डाटा खोज्दा समस्या आयो।</p>";
  }
}

function attachRowSelectionListeners() {
  document.querySelectorAll(".results-table tbody tr").forEach(row => {
    row.style.cursor = "pointer";
    row.title = "यो कोड फारममा भर्न यहाँ क्लिक गर्नुहोस् (Click to fill this code in the form)";
    row.onclick = function() {
      const selectedCode = this.querySelector(".highlight-code").textContent.trim();
      const membershipInput = document.getElementById("membership_no");
      if (membershipInput) {
        membershipInput.value = selectedCode;
        membershipInput.style.backgroundColor = "#e0f2fe";
        membershipInput.style.transition = "background-color 0.5s ease";
        setTimeout(() => { membershipInput.style.backgroundColor = ""; }, 800);
      }
    };
  });
}

/* ========================================================================
   2. GLOBAL EVENT DELEGATION (Input Masks & Dropdown Triggers)
   ======================================================================== */

document.addEventListener("input", function(event) {
	if (event.target.matches('.nepali-date-field')) {
		let input = event.target;
		let numbersOnly = input.value.replace(/\D/g, '').slice(0, 8);
		let formattedValue = "";
		if (numbersOnly.length > 0) formattedValue += numbersOnly.substring(0, 4); 
		if (numbersOnly.length > 4) formattedValue += "/" + numbersOnly.substring(4, 6); 
		if (numbersOnly.length > 6) formattedValue += "/" + numbersOnly.substring(6, 8); 
		input.value = formattedValue;
	}
});

document.addEventListener("change", function(event) {
  if (event.target.matches('.has-other-select')) {
    const selectElement = event.target;
    const parentWrapper = selectElement.closest('.kym-group-wrapper');
    
    if (parentWrapper) {
      const selectedValue = selectElement.value;
      const targetElements = parentWrapper.querySelectorAll('.other-target-input');

      targetElements.forEach(target => {
        // Read which selective criteria value this target block belongs to
        const displayTrigger = target.getAttribute('data-show-on');

        if (selectedValue === displayTrigger) {
          // Un-hide matching components
          target.disabled = false;
          target.style.display = "block";
          
          // Re-enable nested fields inside the visible target container
          target.querySelectorAll('input').forEach(input => input.disabled = false);
          
          // Focus the first newly initialized field element smoothly
          const primaryInput = target.querySelector('input');
          if (primaryInput) primaryInput.focus();
        } else {
          // Safely wrap away inactive elements
          target.disabled = true;
          target.style.style = ""; // Clean programmatic string cache
          target.style.display = "none";
          
          // Reset child variables so hidden inputs don't pollute sheet submissions
          target.querySelectorAll('input').forEach(input => {
            input.disabled = true;
            input.value = "";
          });
          if (target.tagName.toLowerCase() === 'input') target.value = "";
        }
      });
    }
  }
});

// Reusable helper to populate a <select> element
function populateLocationDropdown(selectElement, optionsArray, valueKey, textKey) {
  selectElement.innerHTML = '<option value="">छान्नुहोस् (Select...)</option>';
  optionsArray.forEach(optionData => {
    const opt = document.createElement('option');
    opt.value = optionData[valueKey]; 
    opt.textContent = optionData[textKey]; 
    selectElement.appendChild(opt);
  });
}

// Main logic to bind the cascading behavior
function setupCascadingAddress(prefix, data) {
  const provSelect = document.getElementById(`${prefix}_province`);
  const distSelect = document.getElementById(`${prefix}_district`);
  const localSelect = document.getElementById(`${prefix}_local`);

  if (!provSelect || !distSelect || !localSelect) return;

  // 1. Extract unique provinces and load them on startup
  const uniqueProvinces = [...new Map(data.map(item => [item.province, item])).values()];
  populateLocationDropdown(provSelect, uniqueProvinces, 'province', 'province_np');

  // 2. Listen for Province change -> Populate Districts
  provSelect.addEventListener('change', function() {
    const selectedProv = this.value;
    distSelect.innerHTML = '<option value="">छान्नुहोस् (Select...)</option>';
    localSelect.innerHTML = '<option value="">छान्नुहोस् (Select...)</option>';

    if (selectedProv) {
      const filteredDistricts = data.filter(item => item.province === selectedProv);
      const uniqueDistricts = [...new Map(filteredDistricts.map(item => [item.district, item])).values()];
      populateLocationDropdown(distSelect, uniqueDistricts, 'district', 'district_np');
    }
  });

  // 3. Listen for District change -> Populate Local Levels
  distSelect.addEventListener('change', function() {
    const selectedProv = provSelect.value;
    const selectedDist = this.value;
    localSelect.innerHTML = '<option value="">छान्नुहोस् (Select...)</option>';

    if (selectedProv && selectedDist) {
      const filteredLocals = data.filter(item => item.province === selectedProv && item.district === selectedDist);
      const uniqueLocals = [...new Map(filteredLocals.map(item => [item.municipality, item])).values()];
      populateLocationDropdown(localSelect, uniqueLocals, 'municipality', 'municipality_np');
    }
  });
}

/* ========================================================================
   3. MAIN INITIALIZATION (One Single DOMContentLoaded for the whole app)
   ======================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  
  // --- A. Dual-Date Auto-population & Picker Initialization ---
  const kymDateAd = document.getElementById('kym_date');
  const kymDateNp = document.getElementById('kym_date_np');

  if (typeof NepaliFunctions !== 'undefined') {
    if (kymDateAd) kymDateAd.value = NepaliFunctions.AD.GetCurrentDate("YYYY-MM-DD");
    if (kymDateNp) kymDateNp.value = NepaliFunctions.BS.GetCurrentDate("YYYY/MM/DD");

    const nepaliDateFields = document.querySelectorAll(".nepali-date-field");
    if (nepaliDateFields.length > 0) {
      nepaliDateFields.nepaliDatePicker({ dateFormat: "YYYY/MM/DD", ndpYear: true, ndpMonth: true, readOnlyInput: false });
    }
  }

  // --- B. Trigger 'Other' Select Dropdowns Default States ---
  document.querySelectorAll('.has-other-select').forEach(select => {
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // --- C. Tabs Navigation Engine ---
  const tabButtons = document.querySelectorAll(".kym-tabs-navigation .tab-btn");
  const formSections = document.querySelectorAll(".kym-form .kym-section");

  tabButtons.forEach(button => {
    button.onclick = function() {
      const targetSection = document.getElementById(this.getAttribute("data-target"));
      if (targetSection) {
        tabButtons.forEach(btn => btn.classList.remove("active"));
        formSections.forEach(section => section.classList.remove("active"));
        this.classList.add("active");
        targetSection.classList.add("active");
        document.querySelector(".kym-tabs-navigation").scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
  });

  // --- D. Family Matrix Builder Engine ---
  const tableBody = document.getElementById("family-matrix-body");
  const addBtn = document.getElementById("add-family-member-btn");
  const maritalStatusSelect = document.getElementById("marital_status");
  
  if (tableBody && addBtn) {
    let globalRowCounter = 0;

    function reindexTableRows() {
      tableBody.querySelectorAll("tr").forEach((row, index) => {
        const snCell = row.querySelector(".serial-number-cell");
        if (snCell) snCell.textContent = index + 1;
      });
    }

    tableBody.oninput = function (e) {
      if (e.target.classList.contains("conditional-family-input")) {
        const conditionalInputs = tableBody.querySelectorAll(".conditional-family-input");
        let oneFilled = false;
        conditionalInputs.forEach(input => { if (input.value.trim() !== "") oneFilled = true; });
        conditionalInputs.forEach(input => { input.required = !oneFilled; });
      }
    };

    function createDynamicRow(defaultRelation = "son") {
      globalRowCounter++;
      const randomToken = Math.random().toString(36).substring(2, 9);
      const rowId = `fam-matrix-row-${Date.now()}-${globalRowCounter}-${randomToken}`;
      
      const dynamicRow = document.createElement("tr");
      dynamicRow.className = "dynamic-member-row animated-matrix-row";
      dynamicRow.id = rowId;

      dynamicRow.innerHTML = `
        <td class="serial-number-cell"></td>
        <td>
          <select name="family_relation[]" class="kym-selector-group">
            <option value="son" ${defaultRelation === 'son' ? 'selected' : ''}>छोरा (Son)</option>
            <option value="daughter" ${defaultRelation === 'daughter' ? 'selected' : ''}>छोरी (Daughter)</option>
            <option value="father_in_law" ${defaultRelation === 'father_in_law' ? 'selected' : ''}>ससुरा (Father-in-law)</option>
            <option value="mother_in_law" ${defaultRelation === 'mother_in_law' ? 'selected' : ''}>सासु (Mother-in-law)</option>
            <option value="brother" ${defaultRelation === 'brother' ? 'selected' : ''}>दाजु/भाइ (Brother)</option>
            <option value="sister" ${defaultRelation === 'sister' ? 'selected' : ''}>दिदी/बहिनी (Sister)</option>
            <option value="grandmother" ${defaultRelation === 'grandmother' ? 'selected' : ''}>हजुरआमा (Grandmother)</option>
						<option value="uncle" ${defaultRelation === 'uncle' ? 'selected' : ''}>काका/मामा (Uncle)</option>
						<option value="aunt" ${defaultRelation === 'aunt' ? 'selected' : ''}>काकी/माइजु (Aunt)</option>
						<option value="nephew" ${defaultRelation === 'nephew' ? 'selected' : ''}>भतिज/भान्जा (Nephew)</option>
						<option value="niece" ${defaultRelation === 'niece' ? 'selected' : ''}>भतिजी/भान्जी (Niece)</option>
          </select>
        </td>
        <td><input type="text" name="family_member_name[]" placeholder="FULL NAME" required></td>
        <td><input type="text" name="family_member_name_nepali[]" placeholder="पूरा नाम थर" required></td>
        <td style="text-align: center;">
          <button type="button" class="matrix-remove-btn remove-member-btn" data-remove="${rowId}" title="हटाउनुहोस्">
            <span class="material-icons">delete_forever</span>
          </button>
        </td>
      `;
      return dynamicRow;
    }

    // 1. Wipe cache to prevent duplicate loads
    tableBody.querySelectorAll(".dynamic-member-row").forEach(row => row.remove());

    // 2. Pre-populate exactly 3 initial dynamic rows
    ["son", "daughter", "other"].forEach(relation => {
      tableBody.appendChild(createDynamicRow(relation));
    });
    reindexTableRows();

    // 3. Spouse Placement Engine
    if (maritalStatusSelect) {
      maritalStatusSelect.onchange = function () {
        const existingSpouseRow = tableBody.querySelector('tr[data-relation="spouse"]');
        if (this.value === "married") {
          if (!existingSpouseRow) {
            const spouseRow = document.createElement("tr");
            spouseRow.className = "static-row animated-matrix-row";
            spouseRow.setAttribute("data-relation", "spouse");
            spouseRow.innerHTML = `
              <td class="serial-number-cell"></td>
              <td>
                <select name="family_relation[]" class="kym-selector-group locked-select" tabindex="-1">
                  <option value="spouse" selected>पति/पत्नी (Spouse) *</option>
                </select>
              </td>
              <td><input type="text" name="family_member_name[]" placeholder="SPOUSE'S NAME" required></td>
              <td><input type="text" name="family_member_name_nepali[]" placeholder="पति वा पत्नीको नाम" required></td>
              <td style="text-align: center;"><span class="material-icons text-muted text-sm">lock</span></td>
            `;
            const grandfatherRow = tableBody.querySelector('tr[data-relation="grandfather"]');
            if (grandfatherRow) grandfatherRow.insertAdjacentElement('afterend', spouseRow);
            else tableBody.insertBefore(spouseRow, tableBody.firstChild);
            reindexTableRows();
          }
        } else {
          if (existingSpouseRow) {
            existingSpouseRow.remove();
            reindexTableRows();
          }
        }
      };
    }

    // 4. Add Single Row safely
    addBtn.onclick = function (e) {
      e.preventDefault();
      tableBody.appendChild(createDynamicRow("son"));
      reindexTableRows();
    };

    // 5. Delete Row safely
    tableBody.onclick = function (e) {
      const deleteBtn = e.target.closest(".matrix-remove-btn");
      if (deleteBtn) {
        e.preventDefault();
        const targetRow = document.getElementById(deleteBtn.getAttribute("data-remove"));
        if (targetRow) {
          targetRow.style.opacity = "0";
          targetRow.style.transform = "translateX(15px)";
          targetRow.style.transition = "all 0.2s ease";
          setTimeout(() => {
            targetRow.remove();
            reindexTableRows();
          }, 200);
        }
      }
    };
  }

	// Fetch the external JSON file
  fetch('assets/data/municipality.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(locationData => {
      // Once data is loaded, initialize the cascading dropdowns
      setupCascadingAddress('perm', locationData);
      setupCascadingAddress('temp', locationData);
    })
    .catch(error => {
      console.error('Error loading municipality data:', error);
    });

  // Auto-fill Temporary Address if "Same as permanent" is checked
  const copyAddressCheckbox = document.querySelector('input[name="copy_permanent"]');
  
  if (copyAddressCheckbox) {
    copyAddressCheckbox.addEventListener('change', function() {
      if (this.checked) {
        const tempProv = document.getElementById('temp_province');
        tempProv.value = document.getElementById('perm_province').value;
        tempProv.dispatchEvent(new Event('change'));

        const tempDist = document.getElementById('temp_district');
        tempDist.value = document.getElementById('perm_district').value;
        tempDist.dispatchEvent(new Event('change'));

        document.getElementById('temp_local').value = document.getElementById('perm_local').value;
        document.getElementById('temp_ward').value = document.getElementById('perm_ward').value;

        document.querySelector('input[name="temp_tole"]').value = document.querySelector('input[name="perm_tole"]').value;
        document.querySelector('input[name="temp_house_no"]').value = document.querySelector('input[name="perm_house_no"]').value;
        document.querySelector('input[name="temp_phone"]').value = document.querySelector('input[name="perm_phone"]').value;
        document.querySelector('input[name="temp_email"]').value = document.querySelector('input[name="perm_email"]').value;
      } else {
        document.getElementById('temp_province').value = "";
        document.getElementById('temp_province').dispatchEvent(new Event('change'));
        document.getElementById('temp_ward').value = "";
        document.querySelector('input[name="temp_tole"]').value = "";
        document.querySelector('input[name="temp_house_no"]').value = "";
        document.querySelector('input[name="temp_phone"]').value = "";
        document.querySelector('input[name="temp_email"]').value = "";
      }
    });
  }

	// --- E. Document Upload Drag-and-Drop Matrix Engine ---
  const dropzones = document.querySelectorAll(".upload-dropzone");
  
  // Storage dictionary structure object to retain base64 files strings for the form submit layer
  const uploadedFilesStore = {};

  dropzones.forEach(dropzone => {
    const inputElement = dropzone.querySelector(".hidden-file-input");
    const parentCard = dropzone.closest(".document-upld-card-box");
    const groupName = parentCard.getAttribute("data-field-group");
    const actionsLayer = parentCard.querySelector(".preview-delete-actions");

    // 1. Click wrapper connection link to trigger input window
    dropzone.onclick = function(e) {
      if (e.target !== inputElement) {
        inputElement.click();
      }
    };

    // 2. Visual highlight triggers on Drag Over/Leave states
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover-active");
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover-active");
      }, false);
    });

    // 3. Process dropped item files stream directly
    dropzone.addEventListener("drop", (e) => {
      const transferData = e.dataTransfer;
      const droppedFiles = transferData.files;
      if (droppedFiles.length > 0) {
        inputElement.files = droppedFiles; // Bind files to actual html input array
        processFileConversion(droppedFiles[0], groupName, actionsLayer);
      }
    });

    // 4. Trace normal click selection triggers via file input window
    inputElement.onchange = function() {
      if (this.files.length > 0) {
        processFileConversion(this.files[0], groupName, actionsLayer);
      }
    };

    // 5. Wire up the View/Preview File action routine hook (MODAL POPUP VERSION)
    parentCard.querySelector(".btn-view-file").onclick = function(e) {
      e.preventDefault();
      const targetBase64 = uploadedFilesStore[groupName];
      
      if (targetBase64) {
        const modal = document.getElementById("kym-image-viewer-modal");
        const modalImg = document.getElementById("kym-modal-target-img");
        
        if (modal && modalImg) {
          modalImg.src = targetBase64; // Inject the Base64 image directly
          modal.classList.add("modal-active"); // Reveal the popup
        }
      } else {
        alert("कृपया पहिले फाइल अप्लोड गर्नुहोस्।");
      }
    };

    // 6. RESTORED: Wire up the Clear/Delete layout action routine hook
    parentCard.querySelector(".btn-delete-file").onclick = function(e) {
      e.preventDefault();
      inputElement.value = ""; // Empty input cache
      delete uploadedFilesStore[groupName]; // Purge base64 storage reference
      actionsLayer.classList.add("hidden-action-layer"); // Re-hide panel interface links
      dropzone.style.pointerEvents = "auto"; // Re-enable upload dropzone click operations
      dropzone.style.opacity = "1";
    };
  });

  // RESTORED: Base64 file reader pipeline helper function
  function processFileConversion(file, storageKey, uiLayer) {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file); // Encode file format systematically to Base64 String
    fileReader.onload = function() {
      // Retain base64 output string internally for backend submission
      uploadedFilesStore[storageKey] = fileReader.result;
      
      // Update UI panels states to inform file load complete
      uiLayer.classList.remove("hidden-action-layer");
      const targetDropzone = document.getElementById(`dropzone-${storageKey.replace('_', '-')}`);
      if (targetDropzone) {
        targetDropzone.style.pointerEvents = "none"; // Lock upload panel click states
        targetDropzone.style.opacity = "0.6";
      }
    };
  }

  // Global Observers to Close the Custom Image Viewer Modal
  const imageModal = document.getElementById("kym-image-viewer-modal");
  if (imageModal) {
    const closeBtn = imageModal.querySelector(".kym-modal-close-btn");

    // Close when clicking the "X" button
    closeBtn.onclick = function() {
      imageModal.classList.remove("modal-active");
    };

    // Close automatically if the user clicks anywhere on the dark background overlay
    imageModal.onclick = function(e) {
      if (e.target === imageModal) {
        imageModal.classList.remove("modal-active");
      }
    };

    // Close if user hits the 'Escape' key on their keyboard
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && imageModal.classList.contains("modal-active")) {
        imageModal.classList.remove("modal-active");
      }
    });
  }
});