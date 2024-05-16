import {Router} from "express"
import {Balade} from "./model.js"

const router =  Router()

router.get("/all",async function(req,rep) {
  const response = await Balade.find({});
  rep.json(response);
});

router.get("/id/:id",async function(req,rep) {
  try {
    const response = await Balade.findById(req.params.id);
    rep.json(response);
  } catch (error) {
    console.error("Erreur ",error);
  }
});

router.get("/search/:search", async (req,rep) => {
  try {
      const search =  req.params.search;
      const reponse = await Balade.find( {$or: [
          { texte_intro: { $regex: search, $options: "i"} },
          { nom_poi:{ $regex: search, $options: "i"} }
      ]});
      rep.json(reponse);
  } catch (error) {
      console.error("Erreur lors de la récupération des documents :", error);
  } 
});

router.get("/site-internet",async function(req,rep) {
  const response = await Balade.find({url_site : {$ne: null }});
  rep.json(response);
});

router.get("/mot-cle",async function(req,rep) {
  const response = await Balade.find({
    "mot_cle.5" :{$exists : true} });
  rep.json(response);
});

router.get("/publie/:annee",async function(req,rep) {
  try{
    const annee = req.params.annee;
    const reponse = await Balade.find({
      date_saisie: {
        $regex: `^${annee}`
      }
    }).sort({ date_saisie: 1 });
    if (reponse.length === 0) {
      return rep.json({ message: 'Aucune balade trouvée pour cette année' });
    }
    rep.json(reponse);
  }catch (error) {
    rep.status(500).json({ message: error.message });
  }
});

router.get("/arrondissement/:num_arrondissement",async function(req,rep) {
  try {
    const numArrondissement = req.params.num_arrondissement;
    const response = await Balade.find({
       code_postal: { $regex: numArrondissement + "$"} }).count();
    rep.json(response);
  }catch (error) {
    rep.status(500).json({ message: error.message });
  }
});

router.get("/synthese", async function (req, rep) {
  try{
    const reponse = await Balade.aggregate([{
          $group: {_id: "$code_postal",count: { $sum: 1 }}
        },{$sort: { _id: 1 }}
    ]);
    rep.json(reponse);
  }catch(error){
    rep.status(500).json({ message: error.message });
  }
});

router.get("/categories", async function (req, rep) {
  try {
    const response = await Balade.distinct("categorie");
    rep.json(response);
  }catch(error){
    rep.status(500).json({ message: error.message});
  }
});

router.post("/add", async function (req, rep) {
  const newBalade = new Balade(req.body);
  if (!newBalade.nom_poi || !newBalade.adresse || !newBalade.categorie) {
    return rep.status(400).json({ message: "Champs manquants" });
  }
  const response = await newBalade.save();
  rep.json(response);
});

router.put("/add-mot-cle/:id", async function (req, rep) {
  try{
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return rep.status(400).json({ message: "ID invalide" });
    }
    const balade = await Balade.findById(id);
    if (!balade) {
      return rep.status(404).json({ message: "Balade non trouvée" });
    }
    const nouveauMot = req.body.mot_cle;
    if (balade.mot_cle.includes(nouveauMot)) {
      return rep.status(409).json({ message: "Mot clé déjà présent" });
    }
    balade.mot_cle.push(nouveauMot);
    await balade.save();
    rep.status(200).json({ message: "Mot clé ajouté avec succès" });
  }catch (error){
    rep.status(500).json({ message: error.message});
  }
  });

router.put('/update-one/:id', async (req, res) => {
  try {
    const reponse = await Balade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reponse) {
      return res.status(404).json({ message: 'Aucune correspondance' });
    }
    res.status(200).json(reponse);
  } catch (error) {
    console.log(error)
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Identifiant invalide' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/update-many/:search', async (req, res) => {
  const search = req.params.search;
  const newNomPoi = req.body.nom_poi;
  if (!newNomPoi) {
    return res.status(400).json({ message: 'Une nouvelle valeur est requise' });
  }
  try {
    const result = await Balade.updateMany(
      { texte_description: { $regex: search, $options: 'i' } },
      { $set: { nom_poi: newNomPoi } }
    );
    if (result.nModified === 0) {
      return res.status(404).json({ message: 'Aucune correspondance' });
    }
    res.status(200).json({ message: 'Modification effectué' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBalade = await Balade.findByIdAndDelete(req.params.id);
    if (!deletedBalade) {
      return res.status(404).json({ message: 'La balade n\'est pas trouvé' });
    }
    res.status(200).json({ message: 'Suppresion effectué' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;