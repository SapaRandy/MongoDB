import { Schema , model  } from "mongoose"

// Entity 

const schemaBalade = new Schema({
    identifiant: String,
    adresse: String,
    code_postal: String,
    parcours: Array,
    url_image: String,
    copyright_image: String,
    legende: String,
    categorie: String,
    nom_poi: String,
    date_saisie: String,
    mot_cle: Array,
    ville: String,
    texte_intro: String,
    texte_description: String,
    url_site: String,
    fichier_image: {
        thumbnail: Boolean,
        filename: String,
        format: String,
        width: Number,
        mimetype: String,
        etag: String,
        id: String,
        last_synchronized: Date,
        color_summary: Array,
        height: Number
    },
    geo_shape: {
        type: String,
        geometry:{
            coordinates: Array,
            type: String
        },
        properties:{

        }
    },
    geo_point_2d:{
        long: Number,
        lat: Number
    }
},{collection:"balade"})

const Balade = model("balade", schemaBalade) ; 
// "vehicules" nom de la Collection dans la base flotte (mis dans la connexion )



export { Balade } ; // fin 