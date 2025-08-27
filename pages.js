// === pages.js ===
export let bod = document.querySelector('.bod');

export let initialPage = `
 <div class="side">
        <div class="header">
            <div class="title">
                <img src="doctor.png" alt="Add User" width="50" height="50">
            </div>
        </div>
        <div class="footer">
            <div class="search">
                <input type="search" class="searchClient">
            </div>
            <div class="today nav-btn" data-page="today">
                <img src="today.png" alt="Add User" width="30" height="30">
                today's clients
            </div>
            <div class="clientsList nav-btn" data-page="clients">
                <img src="member-list.png" alt="Add User" width="30" height="30">
                Clients list
            </div>
            <div class="partnerList nav-btn" data-page="partners">
                <img src="deal.png" alt="Add User" width="30" height="30">
                Partners list
            </div>
            <div class="mySpace nav-btn" data-page="myspace">
                <img src="resume.png" alt="Add User" width="30" height="30">
                mySpace
            </div>
        </div>
    </div>
`;

export let clientsListPage = `
<div class="pr">
    <div class="tools">
        <div class="pageTitle">Patients list :</div>
        <button class="add"><img src="user-add.png" width="24" height="24"> add new client</button>
    </div>
    <div class="main">
        <div class="details">
            <div class="nameHtml">name</div>
            <div class="rndHtml">rnd date</div>
            <div class="caseHtml">case</div>
            <div class='payement'>payement</div>
            <div class="editHtml"></div>
        </div>
        <div class="list"></div>
    </div>
</div>

<div class="addwindow" style="display:none">
    <div class="newClient"><p>add new client</p></div>
    <div class="nameInput"><p>client name :</p><input type="text" class="clientNameInput"></div>
    <div class="dateInput"><p>rendez vous date :</p><input type='date' class="clientDateInput"></div>
    <div class="caseInput">
        <label><p>Choose a case:</p></label> 
        <select class="clientCaseInput">
          <option value=""></option>
          <option value="ODF">ODF</option>
          <option value="blanchiment">Blanchiment</option>
          <option value="plombage">plombage</option>
        </select>
    </div>
    

    <div class="buttons">
        <button class="finalAdd">add</button>
        <button class="cancel">cancel</button>
    </div>
</div>
`;

export let todayClientPage = `
<div class="pr">
    <div class="tools">
        <div class="pageTitle">today's clients :</div>
    </div>
    <div class="todaymain">
        <div class="intro">
            <div class="dateintro">
                <div class="todayIcon"></div>
                <div class="todaydate"></div>
            </div>
            <div class="todaydetails">
                <div class="todaynameHtml">name</div>
                <div class="todaycaseHtml">case</div>
            </div>
        </div>
        <div class="todayclientlist"></div>
    </div>
</div>
`;

bod.innerHTML = initialPage ;
