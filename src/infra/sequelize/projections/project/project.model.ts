import { DataTypes, Op, where, col } from 'sequelize'

export const MakeProjectModel = (sequelize) => {
  const Project = sequelize.define(
    'project',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      appelOffreId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      periodeId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numeroCRE: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      familleId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nomCandidat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nomProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      puissanceInitiale: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      puissance: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      prixReference: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      evaluationCarbone: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      note: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      nomRepresentantLegal: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      adresseProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      codePostalProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      communeProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      departementProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      territoireProjet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      regionProjet: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      classe: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fournisseur: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      actionnaire: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      motifsElimination: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isFinancementParticipatif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      isInvestissementParticipatif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      engagementFournitureDePuissanceAlaPointe: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      notifiedOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      garantiesFinancieresDueOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      garantiesFinancieresRelanceOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      dcrDueOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      completionDueOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      abandonedOn: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      certificateFileId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      numeroGestionnaire: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  )

  Project.associate = (models) => {
    const { File, UserProjects, ProjectStep } = models
    Project.belongsTo(File, {
      foreignKey: 'garantiesFinancieresFileId',
      as: 'garantiesFinancieresFileRef',
    })

    Project.belongsTo(File, {
      foreignKey: 'dcrFileId',
      as: 'dcrFileRef',
    })

    Project.belongsTo(File, {
      foreignKey: 'certificateFileId',
      as: 'certificateFile',
    })

    Project.hasMany(UserProjects, {
      as: 'users',
    })

    Project.hasOne(ProjectStep, {
      as: 'gf',
      foreignKey: 'projectId',
      scope: {
        type: 'garantie-financiere',
        [Op.or]: [{ status: ['à traiter', 'validé'] }, { status: null }],
      },
    })

    Project.hasOne(ProjectStep, {
      as: 'dcr',
      foreignKey: 'projectId',
      scope: {
        [Op.and]: where(col('dcr.type'), Op.eq, 'dcr'),
      },
    })

    Project.hasOne(ProjectStep, {
      as: 'ptf',
      foreignKey: 'projectId',
      scope: {
        [Op.and]: where(col('ptf.type'), Op.eq, 'ptf'),
      },
    })
  }

  return Project
}
