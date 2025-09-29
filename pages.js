// === pages.js ===
export let initialPage = `
 <div class="side">
        <div class="header">
            <div class="home">
                <img src="doctor.png" alt="Ajouter un médecin" width="50" height="50">
            </div>
        </div>
        <div class="footer">
            <div class="search">
                <input type="search" class="searchClient" placeholder="Rechercher ...">
            </div>
            <div class="today nav-btn" data-page="today">
                <img src="today.png" alt="Aujourd'hui" width="30" height="30">
                Patients d'aujourd'hui
            </div>
            <div class="clientsList nav-btn" data-page="clients">
                <img src="member-list.png" alt="Liste des patients" width="30" height="30">
                Liste des patients
            </div>
            <div class="partnerList nav-btn" data-page="partners">
                <img src="deal.png" alt="Partenaires" width="30" height="30">
                Liste des partenaires
            </div>
            <div class="mySpace nav-btn" data-page="myspace">
                <img src="resume.png" alt="Mon espace" width="30" height="30">
                Mon espace
            </div>
        </div>
    </div>
`;

export let doctorsPage  = `
<div class='back'>
    <img src="back.jpeg"  >
</div>
    <div class="doctorShow">
        <div class="addNewDoc">
            <div class='addNewDocBtn'>
            <img src="user-add.png" width="24" height="24"> Ajouter un nouveau médecin
            </div>
        </div>
   </div>
   <div class="addNewDocWind">
    <div class="docTitle">
        <b>Ajouter un nouveau médecin</b>
        <div class='cancelDocBtn'>
            <img src="cross-small.png" alt="Aujourd'hui" width="30" height="30">
        </div>
    </div>
    <div class="docNameInputDiv">
    <p>Nom du médecin :</p>
        <input class="docNameInput" type="text">
    </div>
    <div>
        <label><p>doctor type:</p></label> 
    <select class="doctorTypeInput">
        
        <option value="owner">owner</option>
        <option value="coworker">coworker</option>

    </select>
    </div>
    <div class='finalDocAdd'>
    Valider
    </div>
</div>
`;

export let clientsListPage = `
<div class="pr">
    <div class="tools">
        <div class="pageTitle">Liste des patients :</div>
        <button class="add"><img src="user-add.png" width="24" height="24"> Ajouter un nouveau patient</button>
    </div>
    <div class="main">
        <div class="details">
            <div class="nameHtml">Nom</div>
            <div class="rndHtml">rendez-vous</div>
            <div class="caseHtml">Cas</div>
            <div class='payement'>Paiement</div>
            <div class="editHtml"></div>
        </div>
        <div class="list">
           
</div>
    </div>
</div>

<div class="addwindow" style="display:none">
    <div class="newClient"><p>Ajouter un nouveau patient</p></div>
    <div class="nameInput"><p>Nom du patient :</p><input type="text" class="clientNameInput"></div>
    <div class="dateInput"><p>Date du rendez-vous :</p><input type='date' class="clientDateInput"></div>
    <div class="caseInput">
        <label><p>Choisir un cas :</p></label> 
        <select class="clientCaseInput">
          <option value=""></option>
          <option value="ODF">ODF</option>
          <option value="Blanchiment">Blanchiment</option>
          <option value="Plombage">Plombage</option>
        </select>
    </div>

    <div class="buttons">
        <button class="finalAdd">Ajouter</button>
        <button class="cancel">Annuler</button>
    </div>
</div>
`;

export let todayClientPage = `
<div class="pr">
    <div class="tools">
        <div class="pageTitle">Patients d'aujourd'hui :</div>
    </div>
    <div class="todaymain">
        <div class="intro">
            <div class="dateintro">
                <div class="todayIcon"></div>
                <div class="todaydate"></div>
            </div>
            <div class="todaydetails">
                <div class="todaynameHtml">Nom</div>
                <div class="todaycaseHtml">Cas</div>
            </div>
        </div>
        <div class="todayclientlist"></div>
    </div>
</div>
`;


